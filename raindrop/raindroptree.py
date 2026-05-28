import json
import html
import re

sc_data_root = "/Users/azzalos/g/suttacentral/sc-data"

def create_html(collection, main_title):
    output_file = f'{collection}_raindrop.html'
    tree_file = f'{sc_data_root}/structure/tree/sutta/{collection}-tree.json'
    name_file = f'{sc_data_root}/sc_bilara_data/translation/en/sujato/name/sutta/{collection}-name_translation-en-sujato.json'
    blurb_file = f'{sc_data_root}/sc_bilara_data/root/en/blurb/{collection}-blurbs_root-en.json'

    with open(tree_file) as f:
        tree = json.load(f)

    with open(name_file) as f:
        raw_names = json.load(f)

    # Build lookup dicts
    names = {}
    for k, v in raw_names.items():
        parts = k.split('.')
        if len(parts) >= 2:
            names['.'.join(parts[1:])] = v.strip()

    blurbs = {}

    if collection not in ("thag", "thig"):
        with open(blurb_file) as f:
            raw_blurbs = json.load(f)
        for k, v in raw_blurbs.items():
            parts = k.split(':')
            if len(parts) >= 2:
                blurbs[parts[1]] = v.strip()

    # Substrings to strip from folder headings
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
        """SuttaCentral URL for the given ID."""
        return f"https://suttacentral.net/{id_str}/en/sujato?lang=en&layout=linebyline&reference=none&notes=asterisk&highlight=false&script=latin"

    def remove_substring(text_variable, string_to_remove):
        """
        Removes a specific string from a text variable and returns the cleaned text.
        It also cleans up any accidental double spaces or trailing spaces left behind.
        """
        text_str = str(text_variable)
        if string_to_remove in text_str:
            cleaned_text = text_str.replace(string_to_remove, "")
            cleaned_text = " ".join(cleaned_text.split())
            return cleaned_text
        return text_str

    def get_label(id_str):
        """Get 'ID Name' label, or just 'ID' if no name found."""
        upper_id = id_str.upper().replace('-', '-')
        name = names.get(id_str, '')
        if name:
            name = name.rstrip()
            return html.escape(f"{upper_id} {name}"), True
        return html.escape(upper_id), False

    def get_title(node):
        """
        Get the file path to the english translation for the sutta
        represented by node (e.g. AN1, MN14, SN47.35, etc)
        """
        extra_path = f'{collection}'
        match collection:
            case "sn" | "an":
                folder = node.split('.')[0]
                extra_path = f'{collection}/{folder}'
            case "thag" | "thig":
                extra_path = f'kn/{collection}'
            case "ud":
                v = node.split('.')[0][2:]
                extra_path = f'kn/{collection}/vagga{v}'
        path = f'{sc_data_root}/sc_bilara_data/translation/en/sujato/sutta/{extra_path}/{node}_translation-en-sujato.json'

        with open(path) as f:
            segments = json.load(f)
        key_iter = iter(segments)
        key = next(key_iter)
        if collection in ("sn", "an", "thig", "thag"):
            next(key_iter)
        if collection in ("thag"):
            next(key_iter)
        return segments[next(key_iter, None)]

    def clean_label(label):
        """Apply all standard label-cleaning transformations for folder headings."""
        for term in ["VAGGA", "VAGGA2", "PEYYALA", "ATTHANA", "EKADHAMMA", "SAMYUTTA", "ANNASAKA", "PANNASA", "NIPATA"]:
            label = re.sub(fr'^.*?{term} ', '', label)
        for sub in SUBS_TO_REMOVE:
            label = remove_substring(label, sub)
        return label

    def needs_index(label):
        """Return True if label should receive a numeric prefix.

        Labels that already begin with two consecutive ASCII capital letters
        (e.g. 'AN1', 'SN47', 'MN14') are left alone; prose headings like
        'With the Elephant' or 'Virtues' get a sequential number.
        """
        return not re.match(r'^[A-Z]{2}', html.unescape(label))

    def render_folder(key, children, display_label, indent):
        """Render a single named group (H3 heading + nested DL block)."""
        pad = '  ' * indent
        lines = []
        desc = blurbs.get(key, '')
        match display_label:
            case "DN":
                display_label = "DN Dīgha Nikāya"
            case "AN":
                display_label = "AN Aṅguttara Nikāya"
            case "MN":
                display_label = "MN Majjhima Nikāya"
            case "SN":
                display_label = "SN Saṁyutta Nikāya"
            case "SNP":
                display_label = "Sutta Nipata"
            case "THAG":
                display_label = "Theragāthā"
            case "THIG":
                display_label = "Therīgāthā"
            case "UD":
                display_label = "Udāna"

        lines.append(f'{pad}<DT><H3>{display_label}</H3>')
        if desc:
            lines.append(f'{pad}<DD>{html.escape(desc)}')
        lines.append(f'{pad}<DL><p>')
        lines.append(render_node(children, indent + 1))
        lines.append(f'{pad}</DL><p>')
        return '\n'.join(lines)

    def render_node(node, indent=0):
        """Recursively render a node from the tree as HTML."""
        pad = '  ' * indent
        lines = []

        if isinstance(node, str):
            # Leaf: individual sutta
            label, hasTitle = get_label(node)
            if not hasTitle:
                title = get_title(node)
                label = f'{label} {title}'.rstrip()
            url = sc_url(node)
            desc = blurbs.get(node, '')
            lines.append(f'{pad}<DT><A HREF="{url}">{label}</A>')
            if desc:
                lines.append(f'{pad}<DD>{html.escape(desc)}')

        elif isinstance(node, list):
            # Each dict item in the list is a sibling folder. We iterate
            # all items together so the index counter is shared across them,
            # rather than resetting to 1 for every single-key dict.
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
                        lines.append(render_folder(key, children, display_label, indent))
                else:
                    lines.append(render_node(item, indent))

        elif isinstance(node, dict):
            # Multi-key dicts (e.g. the tree root {"an": [...]}).
            # Siblings here also share a counter.
            counter = 1
            for key, children in node.items():
                lbl = clean_label(get_label(key)[0])
                if needs_index(lbl):
                    display_label = f'{counter}. {lbl}'
                    counter += 1
                else:
                    display_label = lbl
                lines.append(render_folder(key, children, display_label, indent))

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

    print(f'Done! File {output_file} written.')
    # Count stats
    bookmark_count = len(re.findall(r'<DT><A HREF=', html_out))
    folder_count = len(re.findall(r'<DT><H3>', html_out))
    print(f"Bookmarks: {bookmark_count}")
    print(f"Folders: {folder_count}")

create_html("dn", "Dīgha Nikāya")
create_html("an", "Aṅguttara Nikāya")
create_html("mn", "Majjhima Nikāya")
create_html("sn", "Saṁyutta Nikāya")
create_html("snp", "Sutta Nipata")
create_html("thag", "Theragāthā")
create_html("thig", "Therīgāthā")
create_html("ud", "Udāna")
