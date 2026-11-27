"""
GTM Setup Script - Hanukkah Quiz
Creates Data Layer Variables, Custom Event Triggers, and GA4 Event Tags
for quiz_started, question_answered, quiz_completed events.

Requirements:
  pip install google-api-python-client google-auth-oauthlib

Setup:
  1. Go to https://console.cloud.google.com/
  2. Create a project (or use existing)
  3. Enable "Tag Manager API"
  4. Go to APIs & Services > Credentials > Create Credentials > OAuth client ID
  5. Application type: Desktop app
  6. Download the JSON and save as 'credentials.json' next to this script
  7. Run: python setup_gtm.py
"""

import json
import os
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle

# --- CONFIGURATION ---
ACCOUNT_ID = "6408339693"
CONTAINER_ID = "288984679"
WORKSPACE_ID = "2"
GA4_TAG_NAME = "Google Analytics G-R8RZE5T8Q"  # existing config tag name
MEASUREMENT_ID = "G-R8RZE5T8Q"

SCOPES = ["https://www.googleapis.com/auth/tagmanager.edit.containers"]
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), "credentials.json")
TOKEN_FILE = os.path.join(os.path.dirname(__file__), "token.pkl")

WORKSPACE_PATH = f"accounts/{ACCOUNT_ID}/containers/{CONTAINER_ID}/workspaces/{WORKSPACE_ID}"


def authenticate():
    creds = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as f:
            creds = pickle.load(f)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                print("ERROR: credentials.json not found!")
                print("See instructions at the top of this script.")
                exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "wb") as f:
            pickle.dump(creds, f)

    return build("tagmanager", "v2", credentials=creds)


def get_existing_tags(service):
    result = service.accounts().containers().workspaces().tags().list(
        parent=WORKSPACE_PATH
    ).execute()
    return {t["name"]: t for t in result.get("tag", [])}


def get_existing_triggers(service):
    result = service.accounts().containers().workspaces().triggers().list(
        parent=WORKSPACE_PATH
    ).execute()
    return {t["name"]: t for t in result.get("trigger", [])}


def get_existing_variables(service):
    result = service.accounts().containers().workspaces().variables().list(
        parent=WORKSPACE_PATH
    ).execute()
    return {v["name"]: v for v in result.get("variable", [])}


def create_data_layer_variable(service, name, dl_key, existing):
    if name in existing:
        print(f"  [SKIP] Variable '{name}' already exists")
        return existing[name]["variableId"]

    var = service.accounts().containers().workspaces().variables().create(
        parent=WORKSPACE_PATH,
        body={
            "name": name,
            "type": "v",  # Data Layer Variable
            "parameter": [
                {"type": "integer", "key": "dataLayerVersion", "value": "2"},
                {"type": "boolean", "key": "setDefaultValue", "value": "false"},
                {"type": "template", "key": "name", "value": dl_key},
            ],
        },
    ).execute()
    print(f"  [OK] Created variable '{name}'")
    return var["variableId"]


def create_custom_event_trigger(service, name, event_name, existing):
    if name in existing:
        print(f"  [SKIP] Trigger '{name}' already exists")
        return existing[name]["triggerId"]

    trigger = service.accounts().containers().workspaces().triggers().create(
        parent=WORKSPACE_PATH,
        body={
            "name": name,
            "type": "customEvent",
            "customEventFilter": [
                {
                    "type": "equals",
                    "parameter": [
                        {"type": "template", "key": "arg0", "value": "{{_event}}"},
                        {"type": "template", "key": "arg1", "value": event_name},
                    ],
                }
            ],
        },
    ).execute()
    print(f"  [OK] Created trigger '{name}'")
    return trigger["triggerId"]


def find_ga4_config_tag_id(service):
    result = service.accounts().containers().workspaces().tags().list(
        parent=WORKSPACE_PATH
    ).execute()
    for tag in result.get("tag", []):
        if tag.get("type") in ("gaawc", "dest_ga"):
            print(f"  [INFO] Found GA4 config tag: '{tag['name']}' (type: {tag['type']})")
            return tag["name"]  # return name for tagReference
    return None


def create_ga4_event_tag(service, tag_name, event_name, trigger_id, ga4_config_tag_id, params, existing):
    if tag_name in existing:
        print(f"  [SKIP] Tag '{tag_name}' already exists")
        return

    parameters = [
        {"type": "template", "key": "eventName", "value": event_name},
    ]

    if ga4_config_tag_id:
        parameters.append({"type": "template", "key": "measurementId", "value": ga4_config_tag_id})

    if params:
        event_params = []
        for key, value in params.items():
            event_params.append({
                "type": "map",
                "map": [
                    {"type": "template", "key": "name", "value": key},
                    {"type": "template", "key": "value", "value": value},
                ],
            })
        parameters.append({"type": "list", "key": "eventParameters", "list": event_params})

    # Set measurement ID directly
    parameters = [p for p in parameters if p.get("key") not in ("measurementId", "measurementIdOverride")]
    if ga4_config_tag_id:
        parameters.append({"type": "tagReference", "key": "measurementId", "value": ga4_config_tag_id})
        parameters.append({"type": "template", "key": "measurementIdOverride", "value": MEASUREMENT_ID})
    else:
        parameters.append({"type": "template", "key": "measurementIdOverride", "value": MEASUREMENT_ID})

    tag_body = {
        "name": tag_name,
        "type": "gaawe",  # GA4 Event type
        "parameter": parameters,
        "firingTriggerId": [trigger_id],
    }

    service.accounts().containers().workspaces().tags().create(
        parent=WORKSPACE_PATH,
        body=tag_body,
    ).execute()
    print(f"  [OK] Created tag '{tag_name}'")


def main():
    print("Authenticating with Google...")
    service = authenticate()
    print("Authenticated!\n")

    print("Loading existing GTM entities...")
    existing_vars = get_existing_variables(service)
    existing_triggers = get_existing_triggers(service)
    existing_tags = get_existing_tags(service)
    ga4_config_id = find_ga4_config_tag_id(service)
    print()

    # 1. Create Data Layer Variables
    print("=== Creating Data Layer Variables ===")
    var_ids = {}
    var_ids["question_index"] = create_data_layer_variable(
        service, "DLV - question_index", "question_index", existing_vars
    )
    var_ids["is_correct"] = create_data_layer_variable(
        service, "DLV - is_correct", "is_correct", existing_vars
    )
    var_ids["score"] = create_data_layer_variable(
        service, "DLV - score", "score", existing_vars
    )
    print()

    # 2. Create Custom Event Triggers
    print("=== Creating Custom Event Triggers ===")
    trigger_ids = {}
    trigger_ids["quiz_started"] = create_custom_event_trigger(
        service, "CE - quiz_started", "quiz_started", existing_triggers
    )
    trigger_ids["question_answered"] = create_custom_event_trigger(
        service, "CE - question_answered", "question_answered", existing_triggers
    )
    trigger_ids["quiz_completed"] = create_custom_event_trigger(
        service, "CE - quiz_completed", "quiz_completed", existing_triggers
    )
    print()

    # 3. Create GA4 Event Tags
    print("=== Creating GA4 Event Tags ===")
    create_ga4_event_tag(
        service,
        tag_name="GA4 Event - quiz_started",
        event_name="quiz_started",
        trigger_id=trigger_ids["quiz_started"],
        ga4_config_tag_id=ga4_config_id,
        params={},
        existing=existing_tags,
    )
    create_ga4_event_tag(
        service,
        tag_name="GA4 Event - question_answered",
        event_name="question_answered",
        trigger_id=trigger_ids["question_answered"],
        ga4_config_tag_id=ga4_config_id,
        params={
            "question_index": "{{DLV - question_index}}",
            "is_correct": "{{DLV - is_correct}}",
        },
        existing=existing_tags,
    )
    create_ga4_event_tag(
        service,
        tag_name="GA4 Event - quiz_completed",
        event_name="quiz_completed",
        trigger_id=trigger_ids["quiz_completed"],
        ga4_config_tag_id=ga4_config_id,
        params={
            "score": "{{DLV - score}}",
        },
        existing=existing_tags,
    )
    print()

    print("=== Done! ===")
    print("Go to GTM and click Submit > Publish to activate the changes.")
    print(f"https://tagmanager.google.com/#/container/accounts/{ACCOUNT_ID}/containers/{CONTAINER_ID}/workspaces/{WORKSPACE_ID}/tags")


if __name__ == "__main__":
    main()
