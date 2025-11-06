// Avatar Customization System for University of Indian Constitution
// Features cultural elements and child-friendly customization options

import { AvatarCustomization } from '../types/gamification';

export interface AvatarItem {
  id: string;
  name: string;
  category: AvatarCategory;
  subCategory?: string;
  culturalElement?: boolean;
  description: string;
  unlockRequirement?: {
    type: 'coins' | 'achievement' | 'badge' | 'level' | 'free';
    value: string | number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price?: number; // in Constitutional Coins
  previewUrl?: string;
}

export type AvatarCategory = 
  | 'skin_tone'
  | 'hair_style' 
  | 'hair_color'
  | 'clothing'
  | 'accessories'
  | 'cultural_elements'
  | 'backgrounds'
  | 'poses';

export class AvatarSystem {
  private availableItems: AvatarItem[] = [];

  constructor() {
    this.initializeAvatarItems();
  }

  private initializeAvatarItems(): void {
    this.availableItems = [
      // Skin Tones
      {
        id: 'skin_light',
        name: 'Light',
        category: 'skin_tone',
        description: 'Light skin tone',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'skin_medium',
        name: 'Medium',
        category: 'skin_tone',
        description: 'Medium skin tone',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'skin_dark',
        name: 'Dark',
        category: 'skin_tone',
        description: 'Dark skin tone',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'skin_olive',
        name: 'Olive',
        category: 'skin_tone',
        description: 'Olive skin tone',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },

      // Hair Styles
      {
        id: 'hair_short',
        name: 'Short Hair',
        category: 'hair_style',
        description: 'Classic short hairstyle',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'hair_long',
        name: 'Long Hair',
        category: 'hair_style',
        description: 'Beautiful long hair',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'hair_braided',
        name: 'Braided Hair',
        category: 'hair_style',
        description: 'Traditional braided hairstyle',
        culturalElement: true,
        unlockRequirement: { type: 'coins', value: 100 },
        rarity: 'rare',
        price: 100
      },
      {
        id: 'hair_bun',
        name: 'Hair Bun',
        category: 'hair_style',
        description: 'Elegant hair bun',
        unlockRequirement: { type: 'coins', value: 75 },
        rarity: 'common',
        price: 75
      },
      {
        id: 'hair_curly',
        name: 'Curly Hair',
        category: 'hair_style',
        description: 'Natural curly hair',
        unlockRequirement: { type: 'achievement', value: 'knowledge_seeker' },
        rarity: 'rare'
      },

      // Hair Colors
      {
        id: 'hair_black',
        name: 'Black',
        category: 'hair_color',
        description: 'Classic black hair',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'hair_brown',
        name: 'Brown',
        category: 'hair_color',
        description: 'Rich brown hair',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'hair_auburn',
        name: 'Auburn',
        category: 'hair_color',
        description: 'Beautiful auburn hair',
        unlockRequirement: { type: 'coins', value: 50 },
        rarity: 'common',
        price: 50
      },
      {
        id: 'hair_grey',
        name: 'Grey',
        category: 'hair_color',
        description: 'Distinguished grey hair',
        unlockRequirement: { type: 'badge', value: 'ambedkar_scholar' },
        rarity: 'epic'
      },

      // Clothing
      {
        id: 'clothing_casual',
        name: 'Casual Wear',
        category: 'clothing',
        description: 'Comfortable casual clothing',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'clothing_formal',
        name: 'Formal Wear',
        category: 'clothing',
        description: 'Smart formal attire',
        unlockRequirement: { type: 'coins', value: 150 },
        rarity: 'rare',
        price: 150
      },
      {
        id: 'clothing_kurta',
        name: 'Kurta',
        category: 'clothing',
        subCategory: 'traditional',
        culturalElement: true,
        description: 'Traditional Indian kurta',
        unlockRequirement: { type: 'coins', value: 200 },
        rarity: 'rare',
        price: 200
      },
      {
        id: 'clothing_saree',
        name: 'Saree',
        category: 'clothing',
        subCategory: 'traditional',
        culturalElement: true,
        description: 'Elegant traditional saree',
        unlockRequirement: { type: 'badge', value: 'rights_defender' },
        rarity: 'epic'
      },
      {
        id: 'clothing_dhoti',
        name: 'Dhoti',
        category: 'clothing',
        subCategory: 'traditional',
        culturalElement: true,
        description: 'Traditional dhoti attire',
        unlockRequirement: { type: 'achievement', value: 'ambedkar_scholar' },
        rarity: 'epic'
      },
      {
        id: 'clothing_sherwani',
        name: 'Sherwani',
        category: 'clothing',
        subCategory: 'formal_traditional',
        culturalElement: true,
        description: 'Royal sherwani outfit',
        unlockRequirement: { type: 'level', value: 10 },
        rarity: 'legendary'
      },
      {
        id: 'clothing_lehenga',
        name: 'Lehenga',
        category: 'clothing',
        subCategory: 'traditional',
        culturalElement: true,
        description: 'Beautiful traditional lehenga',
        unlockRequirement: { type: 'coins', value: 300 },
        rarity: 'epic',
        price: 300
      },

      // Accessories
      {
        id: 'acc_glasses',
        name: 'Glasses',
        category: 'accessories',
        description: 'Smart reading glasses',
        unlockRequirement: { type: 'coins', value: 100 },
        rarity: 'common',
        price: 100
      },
      {
        id: 'acc_cap',
        name: 'Cap',
        category: 'accessories',
        description: 'Stylish cap',
        unlockRequirement: { type: 'coins', value: 75 },
        rarity: 'common',
        price: 75
      },
      {
        id: 'acc_scarf',
        name: 'Scarf',
        category: 'accessories',
        description: 'Colorful scarf',
        unlockRequirement: { type: 'coins', value: 80 },
        rarity: 'common',
        price: 80
      },
      {
        id: 'acc_watch',
        name: 'Watch',
        category: 'accessories',
        description: 'Classic wristwatch',
        unlockRequirement: { type: 'achievement', value: 'daily_learner' },
        rarity: 'rare'
      },

      // Cultural Elements
      {
        id: 'cultural_turban_sikh',
        name: 'Sikh Turban',
        category: 'cultural_elements',
        subCategory: 'religious',
        culturalElement: true,
        description: 'Traditional Sikh turban',
        unlockRequirement: { type: 'coins', value: 200 },
        rarity: 'epic',
        price: 200
      },
      {
        id: 'cultural_tilaka_hindu',
        name: 'Tilaka',
        category: 'cultural_elements',
        subCategory: 'religious',
        culturalElement: true,
        description: 'Traditional Hindu tilaka marking',
        unlockRequirement: { type: 'coins', value: 50 },
        rarity: 'rare',
        price: 50
      },
      {
        id: 'cultural_dupatta',
        name: 'Dupatta',
        category: 'cultural_elements',
        subCategory: 'traditional',
        culturalElement: true,
        description: 'Traditional dupatta veil',
        unlockRequirement: { type: 'coins', value: 150 },
        rarity: 'rare',
        price: 150
      },
      {
        id: 'cultural_kada',
        name: 'Kada Bracelet',
        category: 'cultural_elements',
        subCategory: 'jewelry',
        culturalElement: true,
        description: 'Traditional Sikh kada bracelet',
        unlockRequirement: { type: 'badge', value: 'duties_champion' },
        rarity: 'epic'
      },
      {
        id: 'cultural_necklace_gold',
        name: 'Gold Necklace',
        category: 'cultural_elements',
        subCategory: 'jewelry',
        culturalElement: true,
        description: 'Traditional gold necklace',
        unlockRequirement: { type: 'achievement', value: 'constitution_architect' },
        rarity: 'legendary'
      },
      {
        id: 'cultural_earrings_traditional',
        name: 'Traditional Earrings',
        category: 'cultural_elements',
        subCategory: 'jewelry',
        culturalElement: true,
        description: 'Beautiful traditional earrings',
        unlockRequirement: { type: 'coins', value: 120 },
        rarity: 'rare',
        price: 120
      },
      {
        id: 'cultural_bindi',
        name: 'Bindi',
        category: 'cultural_elements',
        subCategory: 'traditional',
        culturalElement: true,
        description: 'Traditional forehead bindi',
        unlockRequirement: { type: 'coins', value: 25 },
        rarity: 'common',
        price: 25
      },

      // Backgrounds
      {
        id: 'bg_classroom',
        name: 'Classroom',
        category: 'backgrounds',
        description: 'Traditional classroom setting',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'bg_library',
        name: 'Library',
        category: 'backgrounds',
        description: 'Peaceful library environment',
        unlockRequirement: { type: 'achievement', value: 'knowledge_seeker' },
        rarity: 'rare'
      },
      {
        id: 'bg_parliament',
        name: 'Parliament House',
        category: 'backgrounds',
        description: 'Indian Parliament House',
        culturalElement: true,
        unlockRequirement: { type: 'badge', value: 'constitution_architect' },
        rarity: 'epic'
      },
      {
        id: 'bg_constitutional_assembly',
        name: 'Constitutional Assembly',
        category: 'backgrounds',
        description: 'Historic Constitutional Assembly hall',
        culturalElement: true,
        unlockRequirement: { type: 'achievement', value: 'ambedkar_scholar' },
        rarity: 'legendary'
      },
      {
        id: 'bg_india_gate',
        name: 'India Gate',
        category: 'backgrounds',
        description: 'Iconic India Gate monument',
        culturalElement: true,
        unlockRequirement: { type: 'coins', value: 250 },
        rarity: 'epic',
        price: 250
      },
      {
        id: 'bg_red_fort',
        name: 'Red Fort',
        category: 'backgrounds',
        description: 'Historic Red Fort',
        culturalElement: true,
        unlockRequirement: { type: 'level', value: 8 },
        rarity: 'epic'
      },

      // Poses
      {
        id: 'pose_standing',
        name: 'Standing',
        category: 'poses',
        description: 'Confident standing pose',
        unlockRequirement: { type: 'free', value: 0 },
        rarity: 'common'
      },
      {
        id: 'pose_thinking',
        name: 'Thinking',
        category: 'poses',
        description: 'Thoughtful pose',
        unlockRequirement: { type: 'coins', value: 50 },
        rarity: 'common',
        price: 50
      },
      {
        id: 'pose_reading',
        name: 'Reading',
        category: 'poses',
        description: 'Engaged in reading',
        unlockRequirement: { type: 'achievement', value: 'knowledge_seeker' },
        rarity: 'rare'
      },
      {
        id: 'pose_namaste',
        name: 'Namaste',
        category: 'poses',
        description: 'Traditional Indian greeting',
        culturalElement: true,
        unlockRequirement: { type: 'coins', value: 100 },
        rarity: 'rare',
        price: 100
      },
      {
        id: 'pose_saluting',
        name: 'Saluting',
        category: 'poses',
        description: 'Respectful saluting pose',
        unlockRequirement: { type: 'badge', value: 'rights_defender' },
        rarity: 'epic'
      },
      {
        id: 'pose_speaking',
        name: 'Speaking',
        category: 'poses',
        description: 'Addressing an audience',
        unlockRequirement: { type: 'achievement', value: 'ambedkar_scholar' },
        rarity: 'epic'
      }
    ];
  }

  // Get available items by category
  getItemsByCategory(category: AvatarCategory): AvatarItem[] {
    return this.availableItems.filter(item => item.category === category);
  }

  // Get cultural items
  getCulturalItems(): AvatarItem[] {
    return this.availableItems.filter(item => item.culturalElement);
  }

  // Get unlocked items for user
  getUnlockedItems(userProfile: any, unlockedItems: string[]): AvatarItem[] {
    return this.availableItems.filter(item => {
      if (unlockedItems.includes(item.id)) return true;
      
      if (!item.unlockRequirement) return true;
      
      switch (item.unlockRequirement.type) {
        case 'free':
          return true;
        case 'coins':
          return userProfile.constitutionalCoins >= (item.unlockRequirement.value as number);
        case 'level':
          return userProfile.profileLevel >= (item.unlockRequirement.value as number);
        case 'achievement':
          return userProfile.achievements.some((a: any) => a.id === item.unlockRequirement!.value);
        case 'badge':
          return userProfile.badges.some((b: any) => b.id === item.unlockRequirement!.value);
        default:
          return false;
      }
    });
  }

  // Get items available for purchase
  getPurchasableItems(userProfile: any): AvatarItem[] {
    return this.availableItems.filter(item => 
      item.price && 
      item.price <= userProfile.constitutionalCoins &&
      !userProfile.avatarConfig.unlockedItems.includes(item.id)
    );
  }

  // Purchase an avatar item
  async purchaseItem(itemId: string, userProfile: any): Promise<{ success: boolean; message: string }> {
    const item = this.availableItems.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    if (!item.price) {
      return { success: false, message: 'Item is not purchasable' };
    }

    if (userProfile.constitutionalCoins < item.price) {
      return { success: false, message: 'Insufficient Constitutional Coins' };
    }

    if (userProfile.avatarConfig.unlockedItems.includes(itemId)) {
      return { success: false, message: 'Item already owned' };
    }

    // Process purchase
    userProfile.constitutionalCoins -= item.price;
    userProfile.avatarConfig.unlockedItems.push(itemId);

    return { success: true, message: `Successfully purchased ${item.name}!` };
  }

  // Create default avatar configuration
  createDefaultAvatar(): AvatarCustomization {
    return {
      skinTone: 'skin_medium',
      hairStyle: 'hair_short',
      hairColor: 'hair_black',
      clothing: 'clothing_casual',
      accessories: [],
      culturalElements: {
        turban: false,
        tilaka: false,
        jewelry: [],
        traditionalClothes: undefined
      },
      background: 'bg_classroom',
      pose: 'pose_standing',
      unlockedItems: [
        'skin_light', 'skin_medium', 'skin_dark', 'skin_olive',
        'hair_short', 'hair_long', 'hair_black', 'hair_brown',
        'clothing_casual', 'bg_classroom', 'pose_standing'
      ]
    };
  }

  // Update avatar configuration
  updateAvatarConfig(
    currentConfig: AvatarCustomization, 
    updates: Partial<AvatarCustomization>
  ): AvatarCustomization {
    return {
      ...currentConfig,
      ...updates,
      culturalElements: {
        ...currentConfig.culturalElements,
        ...updates.culturalElements
      }
    };
  }

  // Get item by ID
  getItemById(itemId: string): AvatarItem | undefined {
    return this.availableItems.find(item => item.id === itemId);
  }

  // Generate avatar preview (for future SVG generation)
  generateAvatarPreview(config: AvatarCustomization): string {
    // This would generate an SVG or return a path to a generated avatar image
    // For now, return a placeholder
    return `/avatars/preview_${config.skinTone}_${config.hairStyle}_${config.clothing}.svg`;
  }

  // Get recommendations based on user's progress
  getRecommendedItems(userProfile: any): AvatarItem[] {
    const recommendations: AvatarItem[] = [];
    
    // Recommend cultural items for high-level users
    if (userProfile.profileLevel >= 5) {
      recommendations.push(...this.getCulturalItems().slice(0, 3));
    }

    // Recommend achievement-based items
    if (userProfile.achievements.length >= 3) {
      const unlockableItems = this.availableItems.filter(item => 
        item.unlockRequirement?.type === 'achievement' &&
        !userProfile.avatarConfig.unlockedItems.includes(item.id)
      );
      recommendations.push(...unlockableItems.slice(0, 2));
    }

    return recommendations;
  }
}