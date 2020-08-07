import os
import json
import time
import urllib.parse
import urllib.request


def handler(event, context):
    """
    alarm to slack
    """

    print(json.dumps(event))

    for record in event.get("Records"):

        message = json.loads(record.get("Sns").get("Message"))

        title = message.get("AlarmName")
        info = message.get("AlarmDescription")
        newStateReason = message.get("NewStateReason")

        region = os.environ['AWS_REGION']

        log = "https://" + region + ".console.aws.amazon.com/cloudwatch/home?region=" + \
            region + "#alarmsV2:alarm/" + title + "?~(alarmStateFilter~'ALARM)"

        values = {
            "channel": "cloudwatch-alarm",
            "username": "Webhookbot",
            "text": title + "\n" + info + "\n" + newStateReason + "\n" + "<" + log + "|AlarmState>",
            "icon_emoji": ":scream:"
        }

        params = json.dumps(values).encode('utf8')
        req = urllib.request.Request(os.environ['SLACK_WEBHOOK_URL'], data=params, headers={
                                     'content-type': 'application/json'})
        response = urllib.request.urlopen(req)

        print(response.read())
