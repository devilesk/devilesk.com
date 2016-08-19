import argparse
from hyde.model import Expando, Config
from hyde.generator import Generator
from hyde.site import Site
from fswrap import File, Folder
    
def build(source_path, dest, site_path, config_file):
    # create temp site directory
    print 'Creating temp site...'
    TEMP_SITE = File(__file__).parent.child_folder('_temp')
    TEMP_SITE.make()
    TEMP_SITE.child_folder('content').make()
    TEMP_SITE.child_folder('plugins').make()

    # copy layout files to temp site
    layout_folder = Folder(site_path).child_folder('layout')
    assert layout_folder.exists
    layout_folder.copy_contents_to(TEMP_SITE.child_folder('layout'))

    # copy plugins folder
    plugins_folder = Folder(site_path).child_folder('plugins')
    assert plugins_folder.exists
    plugins_folder.copy_contents_to(TEMP_SITE.child_folder('plugins'))
    
    # copy source file to temp site
    temp_source = File(source_path).copy_to(TEMP_SITE.child_folder('content'))
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
    gen.generate_resource_at_path(temp_source.fully_expanded_path, True)

    # copy generated file to destination
    dest_resource = File(dest)
    dest_resource.parent.make()
    deployed_resource = File(Folder(s.config.deploy_root_path).child(temp_source.name))
    assert deployed_resource.exists
    final_resource = deployed_resource.copy_to(dest_resource)
    assert final_resource.exists
    print final_resource.fully_expanded_path
    
    # delete temp
    print 'Cleaning up...'
    TEMP_SITE.delete()

    print 'Done.'
    
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("in_file")
    parser.add_argument("out_file")
    parser.add_argument("--site_path", default='/home/sites/devilesk.com')
    parser.add_argument("--config_file", default='/home/sites/devilesk.com/site-prod.yaml')
    args = parser.parse_args()
    
    build(args.in_file, args.out_file, args.site_path, args.config_file)

if __name__ == "__main__":
    main()