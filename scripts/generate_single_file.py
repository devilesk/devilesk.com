import argparse
import sys
import os
from hyde.model import Expando, Config
from hyde.generator import Generator
from hyde.site import Node
from hyde.engine import Engine
from fswrap import File, Folder
    
def build(in_file, sitepath, config_file):
    e = Engine(raise_exceptions=True)
    s = e.make_site(sitepath, config_file)
    s.load()
    node_path = os.path.join(str(s.content.source_folder), in_file)
    node = s.content.node_from_path(node_path)
    print ('Generating...', node)
    g = Generator(s)
    g.generate_node(node, True)

    print('Done.')
    
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("in_file")
    parser.add_argument("--sitepath", default=os.path.join(sys.path[0], '../'))
    parser.add_argument("--config_file", default=os.path.join(sys.path[0], '../app.yaml'))
    args = parser.parse_args()
    
    build(args.in_file, args.sitepath, args.config_file)

if __name__ == "__main__":
    main()