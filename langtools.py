def corr_punc(text):
    import re
    import os
    import regex
    import jieba
    # Mapping of Korean punctuation to English equivalents
    conversion_mapping = {
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

def txt_json(folder_path, title_ids):
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
                            p = to_pinyin(l)
                            lyrics.append(p)
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
    from tokens import api_key1, api_key2, api_key3

    youtube = build("youtube", "v3", developerKey=api_key3)

    for id in missing_ids:
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

def generate_txt(artists):
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
            with open(f'zh_lyrics/{cnt}.txt', 'w') as f:
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

