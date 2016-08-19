import argparse
from hyde.model import Expando, Config
from hyde.generator import Generator
from hyde.site import Site
from fswrap import File, Folder
    
def build(source_folder, dest, site_path, config_file):
    # create temp site directory
    print 'Creating temp site...'
    TEMP_SITE = File(__file__).parent.child_folder('_temp')
    TEMP_SITE.make()
    temp_content = TEMP_SITE.child_folder('content')
    temp_content.make()

    # copy layout files to temp site
    layout_folder = Folder(site_path).child_folder('layout')
    assert layout_folder.exists
    layout_folder.copy_contents_to(TEMP_SITE.child_folder('layout'))

    # copy plugins folder
    temp_plugins = TEMP_SITE.child_folder('plugins')
    temp_plugins.make()
    plugins_folder = Folder(site_path).child_folder('plugins')
    assert plugins_folder.exists
    plugins_folder.copy_contents_to(temp_plugins)
    
    # copy source folder to temp site
    source = Folder(source_folder)
    print source_folder
    assert source.exists
    temp_source = temp_content.child_folder(source.name)
    temp_source.make()
    source.copy_contents_to(temp_source)
    assert temp_source.exists

    # create config and set deploy root
    c = Config(TEMP_SITE, config_file)
    c.deploy_root = 'deploy'

    # create temp hyde site
    s = Site(TEMP_SITE, c)
    assert s.sitepath == TEMP_SITE.fully_expanded_path
    s.load()
    assert c.deploy_root == 'deploy'

    # generate source file
    print 'Generating...'
    gen = Generator(s)
    gen.generate_node_at_path(temp_source.fully_expanded_path, True)

    # copy generated folder to destination
    dest_folder = Folder(dest)
    dest_folder.make()
    deployed_folder = Folder(s.config.deploy_root_path).child_folder(source.name)
    assert deployed_folder.exists
    final_folder = deployed_folder.copy_contents_to(dest_folder)
    assert final_folder.exists
    print final_folder.fully_expanded_path
    
    # delete temp
    print 'Cleaning up...'
    TEMP_SITE.delete()

    print 'Done.'
    
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("in_folder")
    parser.add_argument("out_folder")
    parser.add_argument("--site_path", default='/home/sites/devilesk.com')
    parser.add_argument("--config_file", default='/home/sites/devilesk.com/site-prod.yaml')
    args = parser.parse_args()
    
    build(args.in_folder, args.out_folder, args.site_path, args.config_file)

if __name__ == "__main__":
    main()