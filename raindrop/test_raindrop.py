import json
import os
import re
import html
import pytest
from raindroptree import process_collection, sc_data_root

# Target a few key collections for thorough testing, or add all of them
TEST_COLLECTIONS = [
    ("dn", "Dīgha Nikāya"),
    ("mn", "Majjhima Nikāya"),
    ("sn", "Saṁyutta Nikāya"),
    ("an", "Aṅguttara Nikāya"),
    ("ud", "Udāna")
]

# --- Helper Functions to Flatten Data for Verification ---

def extract_raw_sutta_ids(node):
    """Recursively finds all individual sutta leaf string IDs in the raw source tree."""
    sutta_ids = []
    if isinstance(node, str):
        sutta_ids.append(node)
    elif isinstance(node, list):
        for item in node:
            sutta_ids.extend(extract_raw_sutta_ids(item))
    elif isinstance(node, dict):
        for key, value in node.items():
            sutta_ids.extend(extract_raw_sutta_ids(value))
    return sutta_ids


def flatten_processed_nodes(nodes):
    """Flattens the output structure into lists of folders and bookmarks for easy assertions."""
    bookmarks = []
    folders = []
    
    def traverse(node_list):
        for node in node_list:
            if node["type"] == "bookmark":
                bookmarks.append(node)
            elif node["type"] == "folder":
                folders.append(node)
                traverse(node.get("children", []))
                
    traverse(nodes)
    return bookmarks, folders


# --- The Test Suite ---

@pytest.mark.parametrize("collection, main_title", TEST_COLLECTIONS)
def test_sutta_collection_integrity(collection, main_title):
    """Thoroughly checks hierarchy, completeness, links, blurbs, and titles."""
    
    tree_file = f'{sc_data_root}/structure/tree/sutta/{collection}-tree.json'
    blurb_file = f'{sc_data_root}/sc_bilara_data/root/en/blurb/{collection}-blurbs_root-en.json'
    
    if not os.path.exists(tree_file):
        pytest.skip(f"Source file {tree_file} not found. Skipping {collection} test.")

    # 1. Load Raw Sources
    with open(tree_file) as f:
        raw_tree = json.load(f)
        
    raw_blurbs = {}
    if os.path.exists(blurb_file):
        with open(blurb_file) as f:
            data = json.load(f)
            for k, v in data.items():
                parts = k.split(':')
                if len(parts) >= 2:
                    raw_blurbs[parts[1]] = v.strip()

    # 2. Get Processed Output Tree
    processed_tree = process_collection(collection, main_title)
    
    # Flatten everything for granular validation
    raw_sutta_ids = extract_raw_sutta_ids(raw_tree)
    processed_bookmarks, processed_folders = flatten_processed_nodes(processed_tree)

    # ----------------------------------------------------
    # TEST 1: Completeness (Nothing left out)
    # ----------------------------------------------------
    assert len(processed_bookmarks) == len(raw_sutta_ids), \
        f"Mismatch in total bookmarks count for {collection}. Raw: {len(raw_sutta_ids)}, Processed: {len(processed_bookmarks)}"

    # ----------------------------------------------------
    # TEST 2: URL / Link Validation
    # ----------------------------------------------------
    for bookmark in processed_bookmarks:
        url = bookmark["url"]
        # Extract the sutta ID from the URL string
        match = re.search(r'suttacentral\.net/([^/]+)/en', url)
        assert match is not None, f"Malformed URL found: {url}"
        
        sutta_id = match.group(1)
        assert sutta_id in raw_sutta_ids, f"Processed bookmark URL contains unknown ID: {sutta_id}"
        
        # Verify URL query parameters are constructed correctly
        assert "layout=linebyline" in url
        assert "reference=none" in url

    # ----------------------------------------------------
    # TEST 3: Blurbs/Descriptions Accuracy
    # ----------------------------------------------------
    # Validate bookmark blurbs
    for bookmark in processed_bookmarks:
        match = re.search(r'suttacentral\.net/([^/]+)/en', bookmark["url"])
        sutta_id = match.group(1)
        expected_blurb = raw_blurbs.get(sutta_id, '')
        assert bookmark["description"] == expected_blurb, \
            f"Blurb mismatch for sutta {sutta_id}. Expected: '{expected_blurb}', Got: '{bookmark['description']}'"

    # ----------------------------------------------------
    # TEST 4: Title Cleanliness & Integrity
    # ----------------------------------------------------
    for bookmark in processed_bookmarks:
        title = bookmark["title"]
        assert len(title.strip()) > 0, f"Found empty title for bookmark: {bookmark['url']}"
        # Ensure HTML entities haven't been double-escaped accidentally
        assert "&amp;" not in title 

    for folder in processed_folders:
        title = folder["title"]
        # Ensure forbidden substrings from SUBS_TO_REMOVE were successfully stripped
        assert "-ANTARAPEYYALA" not in title
        assert "The Linked Discourses on " not in title
        assert "The Chapter on " not in title

    # ----------------------------------------------------
    # TEST 5: Hierarchy Rules
    # ----------------------------------------------------
    # Ensure every folder either contains sub-folders or bookmarks (no empty structures)
    for folder in processed_folders:
        assert len(folder["children"]) > 0, f"Empty folder hierarchy detected: {folder['title']}"
