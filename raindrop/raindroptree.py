import json
import html
import re
import argparse
import os
import shutil

sc_data_root = "/Users/azzalos/g/suttacentral/sc-data"

SUBS_TO_REMOVE = [
    "-ANTARAPEYYALA",
    "-SATTHUSUTTADI",
    "-SIKKHASUTTADIPEYYALAEKADASAKA",
    "The Group of Linked Discourses With ",
    "The Group of Linked Discourses Beginning With ",
    "The Linked Discourses on the ",
    "The Linked Discourses on ",
    "The Linked Discourses With ",
    "The Linked Discourses with ",
    "The Linked Discourses ",
    "Linked Discourses on the ",
    "Linked Discourses on ",
    "Linked Discourses With ",
    "Linked Discourses with ",
    "Linked Discourses ",
    "The Chapter on a ",
    "The Chapter on the ",
    "The Chapter on ",
    "The Chapter of ",
    "The Chapter with ",
    "The Chapter with the ",
    "The Chapter Beginning With ",
    "The Chapter Beginning with "
]

def sc_url(id_str):
    return f"https://suttacentral.net/{id_str}/en/sujato?lang=en&layout=linebyline&reference=none&notes=asterisk&highlight=false&script=latin"

def process_collection(collection, main_title):
    """Loads a collection's data and returns a structured list of node dictionaries."""
    tree_file = f'{sc_data_root}/structure/tree/sutta/{collection}-tree.json'
    name_file = f'{sc_data_root}/sc_bilara_data/translation/en/sujato/name/sutta/{collection}-name_translation-en-sujato.json'
    blurb_file = f'{sc_data_root}/sc_bilara_data/root/en/blurb/{collection}-blurbs_root-en.json'

    try:
        with open(tree_file) as f:
            tree = json.load(f)
    except FileNotFoundError:
        print(f"Warning: Tree file for '{collection}' not found. Skipping.")
        return []

    names = {}
    try:
        with open(name_file) as f:
            raw_names = json.load(f)
        for k, v in raw_names.items():
            parts = k.split('.')
            if len(parts) >= 2:
                names['.'.join(parts[1:])] = v.strip()
    except FileNotFoundError:
        pass

    blurbs = {}
    try:
        with open(blurb_file) as f:
            raw_blurbs = json.load(f)
        for k, v in raw_blurbs.items():
            parts = k.split(':')
            if len(parts) >= 2:
                blurbs[parts[1]] = v.strip()
    except FileNotFoundError:
        pass 

    def remove_substring(text_variable, string_to_remove):
        text_str = str(text_variable)
        if string_to_remove in text_str:
            cleaned_text = text_str.replace(string_to_remove, "")
            cleaned_text = " ".join(cleaned_text.split())
            return cleaned_text
        return text_str

    def get_label(id_str):
        upper_id = id_str.upper().replace('-', '-')
        name = names.get(id_str, '')
        if name:
            name = name.rstrip()
            return html.escape(f"{name}"), True
        return html.escape(upper_id), False

    def get_title_from_file(node):
        extra_path = f'{collection}'
        match collection:
            case "sn" | "an":
                folder = node.split('.')[0]
                extra_path = f'{collection}/{folder}'
            case "thag" | "thig" | "snp" | "dhp" | "iti" | "kp" | "cp" | "ja":
                extra_path = f'kn/{collection}'
            case "ud":
                v = node.split('.')[0][2:]
                extra_path = f'kn/{collection}/vagga{v}'
        
        path = f'/Users/azzalos/g/tampermonkey/mine/sujato/sutta/{extra_path}/{node}_translation-en-sujato.json'
        # path = f'{sc_data_root}/sc_bilara_data/translation/en/sujato/sutta/{extra_path}/{node}_translation-en-sujato.json'

        try:
            with open(path) as f:
                segments = json.load(f)
            key_iter = iter(segments)
            key = next(key_iter)
            if collection in ("sn", "an", "thig", "thag"):
                next(key_iter)
            if collection in ("thag"):
                next(key_iter)
            return segments[next(key_iter, None)]
        except (FileNotFoundError, StopIteration):
            return ""

    def clean_label(label):
        for term in ["VAGGA", "VAGGA2", "PEYYALA", "ATTHANA", "EKADHAMMA", "SAMYUTTA", "ANNASAKA", "PANNASA", "NIPATA"]:
            label = re.sub(fr'^.*?{term} ', '', label)
        for sub in SUBS_TO_REMOVE:
            label = remove_substring(label, sub)
        return label

    def needs_index(label):
        return not re.match(r'^[A-Z]{2}', html.unescape(label))

    def build_node(node):
        """Recursively parses SuttaCentral tree and constructs a list of Python dicts."""
        items = []

        if isinstance(node, str):
            label, hasTitle = get_label(node)
            if not hasTitle:
                title = get_title_from_file(node)
                if title:
                    label = f'{title}'.rstrip()

            item = {
                "id": node,
                "title": label,
                "collection": collection
            }
            desc = blurbs.get(node, '')
            if desc:
                item["description"] = desc
            items.append(item)

        elif isinstance(node, list):
            counter = 1
            for item in node:
                if isinstance(item, dict):
                    for key, children in item.items():
                        lbl = clean_label(get_label(key)[0])
                        if needs_index(lbl):
                            display_label = f'{counter}. {lbl}'
                            counter += 1
                        else:
                            display_label = lbl

                        itm = {
                            "title": display_label,
                        }
                        desc = blurbs.get(key, '')
                        if desc:
                            itm["description"] = desc
                        itm["children"] = build_node(children)
                        items.append(itm)
                else:
                    items.extend(build_node(item))

        elif isinstance(node, dict):
            counter = 1
            for key, children in node.items():
                lbl = clean_label(get_label(key)[0])
                if needs_index(lbl):
                    display_label = f'{counter}. {lbl}'
                    counter += 1
                else:
                    display_label = lbl

                match display_label:
                    case "DN": display_label = "DN Dīgha Nikāya"
                    case "AN": display_label = "AN Aṅguttara Nikāya"
                    case "MN": display_label = "MN Majjhima Nikāya"
                    case "SN": display_label = "SN Saṁyutta Nikāya"
                    case "SNP": display_label = "Sutta Nipāta"
                    case "THAG": display_label = "Theragāthā"
                    case "THIG": display_label = "Therīgāthā"
                    case "UD": display_label = "Udāna"
                    case "DHP": display_label = "Dhammapada"
                    case "ITI": display_label = "Itivuttaka"
                    case "KP": display_label = "Khuddakapāṭha"
                    case "CP": display_label = "Cariyāpiṭaka"
                    case "JA": display_label = "Jātaka"

                desc = blurbs.get(key, '')
                itm = { "title": display_label }
                if desc:
                    itm["description"] = desc
                itm["children"] = build_node(children)
                items.append(itm)

        return items

    return build_node(tree)


def generate_html(unified_tree, output_file):
    """Takes the unified dict tree and writes a single Netscape Bookmark HTML file."""
    
    def render_html_tree(nodes, indent=0):
        pad = '  ' * indent
        lines = []
        for node in nodes:
            if "children" not in node:
                url = sc_url(node["id"])
                title = f'{node["id"].upper()} {html.escape(node["title"])}'
                lines.append(f'{pad}<DT><A HREF="{url}">{title}</A>')
                if node.get("description"):
                    lines.append(f'{pad}<DD>{html.escape(node["description"])}')
            elif "children" in node:
                lines.append(f'{pad}<DT><H3>{html.escape(node["title"])}</H3>')
                if node.get("description"):
                    lines.append(f'{pad}<DD>{html.escape(node["description"])}')
                lines.append(f'{pad}<DL><p>')
                lines.extend(render_html_tree(node.get("children", []), indent + 1))
                lines.append(f'{pad}</DL><p>')
        return lines

    body = '\n'.join(render_html_tree(unified_tree, 1))

    html_out = f"""<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>SuttaCentral Collections</H1>
<DL><p>
{body}
</DL><p>
"""

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_out)

    bookmark_count = len(re.findall(r'<DT><A HREF=', html_out))
    folder_count = len(re.findall(r'<DT><H3>', html_out))
    print(f"Done! HTML File '{output_file}' written.")
    print(f"Bookmarks: {bookmark_count}")
    print(f"Folders: {folder_count}")


def generate_md(unified_tree, output_dir):
    """Generates a folder structure with Markdown files for each sutta."""
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

    def sanitize(name):
        return re.sub(r'[\\/*?:"<>|]', "", html.unescape(name)).strip()

    def get_sutta_body(node_id, collection):
        extra_path = f'{collection}'
        match collection:
            case "sn" | "an":
                folder = node_id.split('.')[0]
                extra_path = f'{collection}/{folder}'
            case "thag" | "thig" | "snp" | "dhp" | "iti" | "kp" | "cp" | "ja":
                extra_path = f'kn/{collection}'
            case "ud":
                v = node_id.split('.')[0][2:]
                extra_path = f'kn/{collection}/vagga{v}'

        # path = f'{sc_data_root}/sc_bilara_data/translation/en/sujato/sutta/{extra_path}/{node_id}_translation-en-sujato.json'
        path = f'/Users/azzalos/g/tampermonkey/mine/sujato/sutta/{extra_path}/{node_id}_translation-en-sujato.json'

        try:
            with open(path) as f:
                segments = json.load(f)
        except FileNotFoundError:
            return []

        key_iter = iter(segments)
        try:
            next(key_iter)
            if collection in ("sn", "an", "thig", "thag"):
                next(key_iter)
            if collection in ("thag"):
                next(key_iter)
            next(key_iter) # Title entry
        except StopIteration:
            pass

        paragraphs = []
        current_block = None
        current_paragraph = []

        for k in key_iter:
            parts = k.split(':')
            if len(parts) == 2:
                block = parts[1].split('.')[0]
            else:
                block = k
            
            text = str(segments[k])
            is_header = bool(re.match(r'^((?:\d+\.\s*)+)', text))
            
            if is_header:
                if current_paragraph:
                    paragraphs.append(" ".join(current_paragraph))
                    current_paragraph = []
                paragraphs.append(text)
                current_block = block
            elif current_block is None:
                current_block = block
                current_paragraph.append(text)
            elif current_block == block:
                current_paragraph.append(text)
            else:
                if current_paragraph:
                    paragraphs.append(" ".join(current_paragraph))
                current_block = block
                current_paragraph = [text]
                
        if current_paragraph:
            paragraphs.append(" ".join(current_paragraph))

        return paragraphs

    def format_line(line):
        line = str(line)
        match = re.match(r'^((?:\d+\.\s*)+)', line)
        if match:
            level = len(re.findall(r'\d+', match.group(1)))
            if level == 1:
                return f"## {line}"
            elif level == 2:
                return f"### {line}"
            elif level >= 3:
                return f"#### {line}"
        return line

    def traverse(nodes, current_path):
        for node in nodes:
            if "children" in node:
                title = sanitize(node["title"])
                new_path = os.path.join(current_path, title)
                os.makedirs(new_path, exist_ok=True)
                traverse(node["children"], new_path)
            else:
                node_id = node["id"].upper()
                raw_title = node["title"]
                title = sanitize(f"{node_id} {raw_title}")
                file_path = os.path.join(current_path, f"{title}.md")
                
                blurb = node.get("description", "")
                body = get_sutta_body(node["id"], node.get("collection", ""))
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    if blurb:
                        f.write(f"> [!summary] Summary\n{blurb}\n\n")
                    for para in body:
                        para = para.strip()
                        if para:
                            f.write(f"{format_line(para)}\n\n")

    traverse(unified_tree, output_dir)
    print(f"Done! Markdown tree generated in '{output_dir}'.")


def main():
    parser = argparse.ArgumentParser(description="Generate SuttaCentral bookmarks from local repository.")
    parser.add_argument('--html', action='store_true', help="Output as an HTML bookmark file instead of JSON.")
    parser.add_argument('--md', action='store_true', help="Output as a Markdown folder and file structure.")
    args = parser.parse_args()

    collections = [
        ("dn", "Dīgha Nikāya"),
        ("an", "Aṅguttara Nikāya"),
        ("mn", "Majjhima Nikāya"),
        ("sn", "Saṁyutta Nikāya"),
        ("snp", "Sutta Nipata"),
        ("thag", "Theragāthā"),
        ("thig", "Therīgāthā"),
        ("ud", "Udāna"),
        ("dhp", "Dhammapada"),
        ("iti", "Itivutaka"),
        ("kp", "Khuddakapāṭha"),
        ("cp", "Cariyāpiṭaka"),
        ("ja", "Jātaka")
    ]
    
    kn_collection_ids = {"snp", "thag", "thig", "ud", "dhp", "iti", "kp", "cp", "ja"}

    print("Building unified tree...")
    unified_tree = []
    kn_children = []
    
    for coll, title in collections:
        processed_nodes = process_collection(coll, title)
        if coll in kn_collection_ids:
            kn_children.extend(processed_nodes)
        else:
            unified_tree.extend(processed_nodes)

    if kn_children:
        unified_tree.append({
            "title": "KN Khuddaka Nikāya",
            "children": kn_children
        })

    if args.html:
        generate_html(unified_tree, "suttacentral_bookmarks.html")
    elif args.md:
        generate_md(unified_tree, "output")
    else:
        output_file = "suttacentral_bookmarks.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unified_tree, f, indent=2, ensure_ascii=False)
        print(f"Done! JSON File '{output_file}' written.")

if __name__ == "__main__":
    main()
