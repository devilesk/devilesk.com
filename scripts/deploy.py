import os
import sys
import yaml
from subprocess import call
import generate_patch_data
import generate_hero_lore
import generate_item_tooltips
import generate_hero_data
import generate_heroitem_keys

def force_symlink(file1, file2):
    try:
        os.symlink(file1, file2)
    except FileExistsError:
        os.remove(file2)
        os.symlink(file1, file2)
            
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

        force_symlink(os.path.join(sys.path[0], "../dota-mosaic/mosaics"), os.path.join(sys.path[0], "../build/media/images/mosaics/mosaics"))
        force_symlink(os.path.join(sys.path[0], "../dota-mosaic/thumbnails"), os.path.join(sys.path[0], "../build/media/images/mosaics/thumbnails"))
        force_symlink(os.path.join(sys.path[0], "../dota-webassets/dist"), os.path.join(sys.path[0], "../build/media/spritesheets"))
        force_symlink(os.path.join(sys.path[0], "../bootstrap/dist"), os.path.join(sys.path[0], "../build/media/bootstrap"))
        force_symlink(os.path.join(sys.path[0], "../node_modules/dota-datafiles/dist"), os.path.join(sys.path[0], "../build/media/dota-json"))
        
        print('site deployed')
if __name__ == '__main__':
    main()
