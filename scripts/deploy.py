import os
import sys
import yaml
from subprocess import call
import generate_patch_data
import generate_hero_lore
import generate_item_tooltips
import generate_hero_data
import generate_heroitem_keys

def main():
        
    if len(sys.argv) > 1 and 'generate' in sys.argv:
        generate_hero_lore.main()
        generate_item_tooltips.main()
        generate_hero_data.main()
        generate_patch_data.main()
        generate_heroitem_keys.main()
    
    if len(sys.argv) > 1 and 'deploy' in sys.argv:
        hyde_args = ["hyde"]
        if len(sys.argv) > 1 and 'verbose' in sys.argv:
            hyde_args.append("-v")
        
        hyde_args.append("gen")
        
        if len(sys.argv) > 1 and 'regen' in sys.argv:
            hyde_args.append("-r")

        if len(sys.argv) > 1 and 'production' in sys.argv:
            hyde_args.append("-c")
            hyde_args.append(os.path.join(sys.path[0], "../site-prod.yaml"))
            print('using site-prod.yaml')

        print('calling hyde gen with args', hyde_args)

        #call(hyde_args, cwd='/home/sites/devilesk.com')
        call(hyde_args, cwd=os.path.join(sys.path[0], '..'))
        
        print('site deployed')
        
if __name__ == '__main__':
    main()
