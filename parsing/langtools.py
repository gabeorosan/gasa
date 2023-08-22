def corr_punc(text):
    import re
    import os
    import regex
    import jieba
    # Mapping of Korean punctuation to English equivalents
    conversion_mapping = {
        '。': '.', '，': ',', '！': '!', '？': '?', '“': '"', '”': '"',
        '‘': "'", '’': "'", '：': ':', '；': ';', '（': '(', '）': ')',
        '《': '<', '》': '>', '【': '[', '】': ']', '—': '-', '…': '...',
        '\u2026': '...', # Horizontal ellipsis
        '\u3001': ',',  # Ideographic comma
        '\u3002': '.',  # Ideographic full stop
        '\u00A0': ' ',  # No-Break Space
        '\u1680': ' ',  # Ogham Space Mark
        '\u180E': ' ',  # Mongolian Vowel Separator
        '\u2000': ' ',  # En Quad
        '\u2001': ' ',  # Em Quad
        '\u2002': ' ',  # En Space
        '\u2003': ' ',  # Em Space
        '\u2004': ' ',  # Three-Per-Em Space
        '\u2005': ' ',  # Four-Per-Em Space
        '\u2006': ' ',  # Six-Per-Em Space
        '\u2007': ' ',  # Figure Space
        '\u2008': ' ',  # Punctuation Space
        '\u2009': ' ',  # Thin Space
        '\u200A': ' ',  # Hair Space
        '\u200B': ' ',  # Zero Width Space
        '\u202F': ' ',  # Narrow No-Break Space
        '\u205F': ' ',  # Medium Mathematical Space
        '\u3000': ' ',  # Ideographic Space
        '\uFEFF': ' ',  # Zero Width No-Break Space
        '\u201C': '"',  # Left double quotation mark
        '\u201D': '"',  # Right double quotation mark
        '\u2018': "'",  # Left single quotation mark
        '\u2019': "'",  # Right single quotation mark
        '\u201A': "'",  # Single low-9 quotation mark
        '\u201B': "'",  # Single high-reversed-9 quotation mark
        '\u2032': "'",  # Prime (used to denote minutes or feet)
        '\u2035': "'",  # Reversed Prime (used to denote seconds or inches)
        '\u02BC': "'",  # Modifier letter apostrophe
        '\u02BB': "'",  # Modifier letter turned comma
        '\uFF07': "'",  # Fullwidth apostrophe
    }

    for special_char, english_char in conversion_mapping.items():
        text = text.replace(special_char, english_char)
    
    text = re.sub(r' +', ' ', text)

    return text
from pypinyin import lazy_pinyin, Style

def to_pinyin(sentence):
    pinyin_result = []
    for char in sentence:
        if char == ' ':
            pinyin_result.append(' ')
        else:
            char_pinyin = lazy_pinyin(char, style=Style.TONE, neutral_tone_with_five=True)
            pinyin_result.append(char_pinyin[0])
    pinyin_sentence = ''.join(pinyin_result)
    return pinyin_sentence

def jp_txt_json(folder_path, title_ids):
    # the same as txt_json but for japanese
    import re
    import os
    import regex
    import jieba
    import json
    i = 0
    missing_ids = []
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path) and file_path.endswith(".txt"):
            # open the file and read it
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            lines = text.split("\n")
            
            title = corr_punc(lines[0])
            # remove english from the last line
            lyrics = lines[1:]
            lyrics[0] = regex.split(r'[a-zA-Z]', lyrics[0])[-1]
            lyrics[-1] = regex.split(r'[a-zA-Z]', lyrics[-1])[0]
            korean_lyrics = '\n'.join(lyrics)
            korean_lyrics = korean_lyrics.strip().replace('\n\n', '\n')
            
            newlines = []
            for line in lyrics:
                if re.search(r'[a-zA-Z]', line):
                    if not re.search(r'[a-zA-Z]', regex.split(r'[a-zA-Z]', line)[-1]) and bool(re.search(r'[\u3040-\u309F\u4E00-\u9FFF]', regex.split(r'[a-zA-Z]', line)[-1])):
                        newlines.append(regex.split(r'[a-zA-Z]', line)[-1])
                    elif not re.search(r'[a-zA-Z]', regex.split(r'[a-zA-Z]', line)[0]) and bool(re.search(r'[\u3040-\u309F\u4E00-\u9FFF]', regex.split(r'[a-zA-Z]', line)[0])):
                        newlines.append(regex.split(r'[a-zA-Z]', line)[0])
                    else: newlines.append('')
                else:
                    newlines.append(line)
            korean_lyrics = '\n'.join(line.strip() for line in newlines if len(line) and not re.search(r'[a-zA-Z]', line))
            if len(korean_lyrics.split('\n')) > len(lines) * .6 and len(korean_lyrics.split('\n')) > 10:
                lyrics = []
                for l in korean_lyrics.split('\n'):
                    if len(l) > 0:
                        if '[' not in l and ']' not in l:
                            lyrics.append(l)
                if title in title_ids:
                    id = title_ids[title]
                else: id = None
                if id == None:
                    missing_ids.append(title)
                json_data = {
                    "title": title,
                    "lyrics": lyrics,
                    "video_id": id
                }
                # Write the JSON object to a JSON file
                json_file_path = os.path.join(folder_path, f"{i}.json")
                with open(json_file_path, 'w', encoding='utf-8') as json_file:
                    json.dump(json_data, json_file, ensure_ascii=False, indent=2)
                i += 1
    print(str(len(missing_ids)) + " Missing ids")
    print("Total songs: " + str(i))
    return missing_ids

def segment_jp(text):
    import requests
    import json
    from tokens import app_id
    url = "https://labs.goo.ne.jp/api/morph"
    headers = {"Content-Type": "application/json"}
    payload = {
        "app_id": app_id, 
        "request_id":"record001", 
        "sentence": text, 
        "info_filter":"form"
        }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    result = response.json()
    return result.get("word_list")

def generate_furigana(text):
    import requests
    import json
    from tokens import app_id
    url = "https://labs.goo.ne.jp/api/hiragana"
    headers = {"Content-Type": "application/json"}
    payload = {
        "app_id": app_id,
        "sentence": text,
        "output_type": "hiragana"
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))
    result = response.json()
    return result.get("converted")

def tokenize_japanese_text(text):
    # Create a Sudachi tokenizer
    sudachi_tokenizer = dictionary.Dictionary().create()
    mode = tokenizer.Tokenizer.SplitMode.C
    
    # Tokenize the text using the specified mode
    tokens = sudachi_tokenizer.tokenize(text, mode)
    
    # Extract the surface forms of the tokens
    words = [token.surface() for token in tokens]

    return words

def tokenize_japanese_text(text):
    from sudachipy import tokenizer
    from sudachipy import dictionary

    # Create a Sudachi tokenizer
    sudachi_tokenizer = dictionary.Dictionary().create()
    mode = tokenizer.Tokenizer.SplitMode.C
    
    # Tokenize the text using the specified mode
    tokens = sudachi_tokenizer.tokenize(text, mode)
    
    # Extract the surface forms of the tokens
    words = [token.surface() for token in tokens]

    return words

def seg_gen(text):
    result = ' '.join(tokenize_japanese_text(text))
    return result
    

def ko_txt_json(folder_path, title_ids):
    import re
    import os
    import regex
    import json
    i = 0
    missing_ids = []
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path) and file_path.endswith(".txt"):
            # open the file and read it
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
                text = corr_punc(text)
            lines = text.split("\n")
            lyrics = '\n'.join(lines[1:])
            title = corr_punc(lines[0])
            # remove english from the last line
            lyrics = lyrics.split('\n')
            lyrics[0] = regex.split(r'[a-zA-Z]+|[ぁ-んァ-ン一-龥]|\p{P}', lyrics[0])[-1]
            lyrics[-1] = regex.split(r'[a-zA-Z]+|[ぁ-んァ-ン一-龥]|\p{P}', lyrics[-1])[0]
            korean_lyrics = '\n'.join(lyrics)
            korean_lyrics = korean_lyrics.strip().replace('\n\n', '\n')
            
            newlines = []
            for line in lyrics:
                if re.search(r'[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', line):
                    if not re.search(r'[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', regex.split(r'[a-zA-Z]+|[ぁ-んァ-ン一-龥]|\p{P}', line)[-1]):
                        newlines.append(regex.split(r'[a-zA-Z]+|[ぁ-んァ-ン一-龥]|\p{P}', line)[-1])
                    elif not re.search(r'[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', regex.split(r'[a-zA-Z]+|[ぁ-んァ-ン一-龥]|\p{P}', line)[0]):
                        newlines.append(regex.split(r'[a-zA-Z]+|[ぁ-んァ-ン一-龥]|\p{P}', line)[0])
                    else: newlines.append('')
                else:
                    newlines.append(line)
                    
            korean_lyrics = '\n'.join(line.strip() for line in newlines if not re.search(r'[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', line))
            korean_lyrics = '\n'.join(line.strip() for line in korean_lyrics.split('\n') if len(line.split()) > 1 or len(line) > 1)
            if len(korean_lyrics.split('\n')) > len(lines) * .6: 
                if title in title_ids:
                    id = title_ids[title]
                else: id = None
                if id == None:
                    missing_ids.append(title)
                json_data = {
                    "title": title,
                    "lyrics": korean_lyrics.split('\n'),
                    "video_id": id
                }

                # Write the JSON object to a JSON file
                json_file_path = f'{folder_path}/{i}.json'
                with open(json_file_path, 'w', encoding='utf-8') as json_file:
                    json.dump(json_data, json_file, ensure_ascii=False, indent=2)
                
                i += 1
    print("Missing ids: " + str(missing_ids))
    print("Total videos: " + str(i))
    return missing_ids


def zh_txt_json(folder_path, title_ids):
    import re
    import os
    import regex
    import jieba
    import json
    i = 0
    missing_ids = []
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path) and file_path.endswith(".txt"):
            # open the file and read it
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            lines = text.split("\n")
            
            title = corr_punc(lines[0])
            # remove english from the last line
            lyrics = lines[1:]
            lyrics[0] = regex.split(r'[a-zA-Z]', lyrics[0])[-1]
            lyrics[-1] = regex.split(r'[a-zA-Z]', lyrics[-1])[0]
            korean_lyrics = '\n'.join(lyrics)
            korean_lyrics = korean_lyrics.strip().replace('\n\n', '\n')
            
            newlines = []
            for line in lyrics:
                if re.search(r'[a-zA-Z]', line):
                    if not re.search(r'[a-zA-Z]', regex.split(r'[a-zA-Z]', line)[-1]) and bool(re.search(r'[\u4e00-\u9fff]', regex.split(r'[a-zA-Z]', line)[-1])):
                        newlines.append(regex.split(r'[a-zA-Z]', line)[-1])
                    elif not re.search(r'[a-zA-Z]', regex.split(r'[a-zA-Z]', line)[0]) and bool(re.search(r'[\u4e00-\u9fff]', regex.split(r'[a-zA-Z]', line)[0])):
                        newlines.append(regex.split(r'[a-zA-Z]', line)[0])
                    else: newlines.append('')
                else:
                    newlines.append(line)
                    
            korean_lyrics = '\n'.join(line.strip() for line in newlines if len(line) and not re.search(r'[a-zA-Z]', line))
            if len(korean_lyrics.split('\n')) > len(lines) * .6:
                lyrics = []
                for l in korean_lyrics.split('\n'):
                    if len(l) > 0:
                        l = ' '.join(jieba.cut(l))
                        l = corr_punc(l)
                        if '[' not in l and ']' not in l:
                            lyrics.append(l)
                if title in title_ids:
                    id = title_ids[title]
                else: id = None
                if id == None:
                    missing_ids.append(title)
                json_data = {
                    "title": title,
                    "lyrics": lyrics,
                    "video_id": id
                }

                # Write the JSON object to a JSON file
                json_file_path = os.path.join(folder_path, f"{i}.json")
                with open(json_file_path, 'w', encoding='utf-8') as json_file:
                    json.dump(json_data, json_file, ensure_ascii=False, indent=2)
                i += 1
    print(str(len(missing_ids)) + " Missing ids")
    print("Total songs: " + str(i))
    return missing_ids

def update_missing(title_ids, missing_ids):
    from googleapiclient.discovery import build
    import json
    import os
    from tokens import api_key1, api_key2, api_key3, api_key4, api_key5
    i = 0
    youtube = build("youtube", "v3", developerKey=api_key5)

    for id in missing_ids:
        i+=1
        if i == 100:
            youtube = build("youtube", "v3", developerKey=api_key4)
        elif i == 200:
            youtube = build("youtube", "v3", developerKey=api_key3)
        # Assuming the song title is the first line in the "lyrics" field
        song_title = id

        # Search for videos for the song title
        search_response = youtube.search().list(
            q=song_title,
            type="video",
            part="id",
            maxResults=1
        ).execute()

        if len(search_response['items']) == 0:
            print(f"No videos found for '{song_title}'")
            continue
        else:
            title_ids[song_title] = search_response['items'][0]['id']['videoId']
    return title_ids

def generate_txt(artists, folder_path):
    cnt = 0
    from lyricsgenius import Genius
    import re
    from tokens import token
    genius = Genius(token)
    for a in artists:
        res = genius.search_artist(a)

        for i in range(len(res.__dict__['songs'])):
            lyrics = res.__dict__['songs'][i].__dict__['lyrics']
            title = res.__dict__['songs'][i].title + ' - ' + a
            korean_lyrics = title + '\n' + lyrics
            with open(f'{folder_path}/{cnt}.txt', 'w') as f:
                    f.write(korean_lyrics)
                    cnt += 1
    return cnt

def read_title_ids():
    import json
    # read the dictionary title_ids from title_ids.txt
    title_ids = {}
    with open('title_ids.json', 'r') as f:
        title_ids = json.load(f)
    return title_ids


def write_title_ids(title_ids):
    import json
    # write the dictionary title_ids to title_ids.txt
    with open('title_ids.json', 'w') as f:
        json.dump(title_ids, f)

