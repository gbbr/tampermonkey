import json
import html
import re

collection = "sn"
main_title = "Saṃyutta Nikāya"

sc_data_root = "/Users/azzalos/g/suttacentral/sc-data"
output_file = f'{collection}_raindrop.html'
tree_file = f'{sc_data_root}/structure/tree/sutta/{collection}-tree.json'
name_file = f'{sc_data_root}/sc_bilara_data/translation/en/sujato/name/sutta/{collection}-name_translation-en-sujato.json'
blurb_file = f'{sc_data_root}/sc_bilara_data/root/en/blurb/{collection}-blurbs_root-en.json'

# Load data files
with open(tree_file) as f:
    tree = json.load(f)

with open(name_file) as f:
    raw_names = json.load(f)

with open(blurb_file) as f:
    raw_blurbs = json.load(f)

# Build lookup dicts
names = {}
for k, v in raw_names.items():
    parts = k.split('.')
    if len(parts) >= 2:
        names['.'.join(parts[1:])] = v.strip()

blurbs = {}
for k, v in raw_blurbs.items():
    parts = k.split(':')
    if len(parts) >= 2:
        blurbs[parts[1]] = v.strip()

def get_label(id_str):
    """Get 'ID Name' label, or just 'ID' if no name found."""
    upper_id = id_str.upper().replace('-', '-')
    name = names.get(id_str, '')
    if name:
        return f"{upper_id} {name}"
    return upper_id

def sc_url(id_str):
    """SuttaCentral URL for the given ID."""
    return f"https://suttacentral.net/{id_str}/en/sujato"

def remove_substring(text_variable, string_to_remove):
    """
    Removes a specific string from a text variable and returns the cleaned text.
    It also cleans up any accidental double spaces or trailing spaces left behind.
    """
    # Ensure we are working with a string
    text_str = str(text_variable)
    
    # Remove the target string
    if string_to_remove in text_str:
        cleaned_text = text_str.replace(string_to_remove, "")
        
        # Clean up any consecutive spaces created by the removal
        cleaned_text = " ".join(cleaned_text.split())
        return cleaned_text
        
    return text_str

def render_node(node, indent=0):
    """Recursively render a node from the tree as HTML."""
    pad = '  ' * indent
    lines = []

    if isinstance(node, str):
        # Leaf: individual sutta
        label = html.escape(get_label(node))
        url = sc_url(node)
        folder = node.split('.')[0]
        with open(f'{sc_data_root}/sc_bilara_data/translation/en/sujato/sutta/{collection}/{folder}/{node}_translation-en-sujato.json') as f:
            sutta = json.load(f)
        key_iter = iter(sutta)
        next(key_iter)
        next(key_iter)
        title = sutta[next(key_iter, None)]
        desc = blurbs.get(node, '')
        lines.append(f'{pad}<DT><A HREF="{url}">{label} {title}</A>')
        if desc:
            lines.append(f'{pad}<DD>{html.escape(desc)}')
    elif isinstance(node, list):
        for item in node:
            lines.append(render_node(item, indent))
    elif isinstance(node, dict):
        for key, children in node.items():
            label = html.escape(get_label(key))

            # clean labels
            if "VAGGA" in label:
                pattern = r'-[^\s]*VAGGA\s'
                label = re.sub(pattern, ' ', label)
            if "SAMYUTTA" in label:
                pattern = r'-[^\s]*SAMYUTTA\s'
                label = re.sub(pattern, ' ', label)

            label = remove_substring(label, "-ANTARAPEYYALA")
            label = remove_substring(label, "-SATTHUSUTTADI")
            label = remove_substring(label, "-SIKKHASUTTADIPEYYALAEKADASAKA")
            label = remove_substring(label, "The Group of Linked Discourses With ")
            label = remove_substring(label, "The Group of Linked Discourses Beginning With ")
            label = remove_substring(label, "The Linked Discourses on the ")
            label = remove_substring(label, "The Linked Discourses on ")
            label = remove_substring(label, "The Linked Discourses With ")
            label = remove_substring(label, "The Linked Discourses with ")
            label = remove_substring(label, "The Linked Discourses ")
            label = remove_substring(label, "Linked Discourses on the ")
            label = remove_substring(label, "Linked Discourses on ")
            label = remove_substring(label, "Linked Discourses With ")
            label = remove_substring(label, "Linked Discourses with ")
            label = remove_substring(label, "Linked Discourses ")
            label = remove_substring(label, "The Chapter on a ")
            label = remove_substring(label, "The Chapter on the ")
            label = remove_substring(label, "The Chapter on ")
            label = remove_substring(label, "The Chapter with ")
            label = remove_substring(label, "The Chapter with the ")

            desc = blurbs.get(key, '')
            lines.append(f'{pad}<DT><H3>{label}</H3>')
            if desc:
                lines.append(f'{pad}<DD>{html.escape(desc)}')
            lines.append(f'{pad}<DL><p>')
            lines.append(render_node(children, indent + 1))
            lines.append(f'{pad}</DL><p>')

    return '\n'.join(lines)

# Root of tree is {"sn": [...]}
body = render_node(tree)

html_out = f"""<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>{main_title}</H1>
<DL><p>
{body}
</DL><p>
"""

with open(f'./{output_file}', 'w', encoding='utf-8') as f:
    f.write(html_out)

print("Done! File written.")
# Count stats
import re
bookmark_count = len(re.findall(r'<DT><A HREF=', html_out))
folder_count = len(re.findall(r'<DT><H3>', html_out))
print(f"Bookmarks: {bookmark_count}")
print(f"Folders: {folder_count}")
