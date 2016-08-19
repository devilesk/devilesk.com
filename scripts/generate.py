import argparse
from hyde.model import Expando, Config
from hyde.generator import Generator
from hyde.site import Site
from fswrap import File, Folder, FS
import glob
    
def build(source_pattern, dest_path, site_path, config_file):
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
    
    # create config and set deploy root
    c = Config(TEMP_SITE, config_file)
    c.deploy_root = 'deploy'

    # create temp hyde site
    s = Site(TEMP_SITE, c)
    assert s.sitepath == TEMP_SITE.fully_expanded_path
    
    # copy source to temp site
    source_paths = glob.glob(source_pattern)
    for source_path in source_paths:
        source = FS.file_or_folder(source_path)
        assert source.exists
        is_dir = type(source) == Folder
        if is_dir:
            temp_source = temp_content.child_folder(source.name)
            temp_source.make()
            source.copy_contents_to(temp_source)
        else:
            temp_source = source.copy_to(temp_content)
        assert temp_source.exists

        # Load site
        s.load()
        assert c.deploy_root == 'deploy'

        # generate source
        print 'Generating...'
        gen = Generator(s)
        if is_dir:
            gen.generate_node_at_path(temp_source.fully_expanded_path, True)
        else:
            gen.generate_resource_at_path(temp_source.fully_expanded_path, True)

        # copy generated to destination
        dest = Folder(dest_path)
        dest.make()
        assert dest.exists
        assert type(dest) == Folder
        Folder(s.config.deploy_root_path).copy_contents_to(dest)

    # delete temp
    print 'Cleaning up...'
    TEMP_SITE.delete()

    print 'Done.'
    
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("destination")
    parser.add_argument("--site_path", default='/home/sites/devilesk.com')
    parser.add_argument("--config_file", default='/home/sites/devilesk.com/site-prod.yaml')
    args = parser.parse_args()

    build(args.source, args.destination, args.site_path, args.config_file)

if __name__ == "__main__":
    main()