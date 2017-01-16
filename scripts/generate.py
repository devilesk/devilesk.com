import generate_patch_data
import generate_hero_lore
import generate_item_tooltips
import generate_hero_data
import generate_heroitem_keys

def main():
    generate_hero_lore.main()
    generate_item_tooltips.main()
    generate_hero_data.main()
    generate_patch_data.main()
    generate_heroitem_keys.main()
    
if __name__ == '__main__':
    main()
