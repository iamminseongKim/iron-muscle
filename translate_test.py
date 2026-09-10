import urllib.request
import urllib.parse
import json

def translate(text):
    if not text: return text
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=" + urllib.parse.quote(text)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        return ''.join(item[0] for item in data[0])
    except Exception as e:
        print(f"Error translating: {e}")
        return text

print(translate("Hello, how are you?"))
