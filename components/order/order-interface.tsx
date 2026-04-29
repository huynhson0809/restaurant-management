"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  Check,
  UtensilsCrossed,
  Search,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  History,
  Clock,
  Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Category, MenuItem, CartItem } from "@/lib/supabase/types";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/lib/i18n/language-context";
import { initBusinessDaySettings } from "@/lib/business-day";
import { useRestaurantInfo } from "@/lib/use-restaurant-info";
import { LanguageSwitcher } from "@/components/language-switcher";

// Demo data for when Supabase is not configured
const DEMO_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "CƠM",
    name_en: "Rice Dishes",
    sort_order: 1,
    is_active: true,
    created_at: "",
  },
  {
    id: "2",
    name: "BÚN",
    name_en: "Noodle Soup",
    sort_order: 2,
    is_active: true,
    created_at: "",
  },
  {
    id: "3",
    name: "PHỞ",
    name_en: "Pho",
    sort_order: 3,
    is_active: true,
    created_at: "",
  },
  {
    id: "4",
    name: "BÁNH MÌ",
    name_en: "Banh Mi",
    sort_order: 4,
    is_active: true,
    created_at: "",
  },
  {
    id: "5",
    name: "HỦ TIẾU",
    name_en: "Hu Tieu",
    sort_order: 5,
    is_active: true,
    created_at: "",
  },
  {
    id: "6",
    name: "KHAI VỊ",
    name_en: "Appetizers",
    sort_order: 6,
    is_active: true,
    created_at: "",
  },
];

const DEMO_MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    category_id: "1",
    name: "Cơm Tấm Sườn Bì Chả",
    name_en: "Broken Rice with Pork Chop",
    description: "Cơm tấm đặc trưng Sài Gòn với sườn nướng, bì, chả trứng",
    description_en:
      "Signature Saigon broken rice with grilled pork chop, shredded pork skin, and egg meatloaf",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    category_id: "1",
    name: "Cơm Gà Hội An",
    name_en: "Hoi An Chicken Rice",
    description: "Cơm gà xé phay theo phong cách Hội An",
    description_en: "Hoi An style chicken rice with shredded chicken",
    price: 50000,
    image_url:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    category_id: "1",
    name: "Cơm Đùi Gà Nướng",
    name_en: "Grilled Chicken Leg Rice",
    description: "Đùi gà nướng mật ong thơm lừng",
    description_en: "Honey-glazed grilled chicken leg with rice",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 3,
    created_at: "",
    updated_at: "",
  },
  {
    id: "4",
    category_id: "2",
    name: "Bún Thịt Nướng Chả Giò",
    name_en: "Vermicelli with Grilled Pork",
    description: "Bún tươi với thịt nướng và chả giò giòn",
    description_en:
      "Fresh rice vermicelli with grilled pork and crispy spring rolls",
    price: 50000,
    image_url:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "5",
    category_id: "2",
    name: "Bún Bò",
    name_en: "Beef Noodle Soup",
    description: "Bún bò Huế đậm đà sả và mắm ruốc",
    description_en:
      "Hue-style beef noodle soup with lemongrass and shrimp paste",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "6",
    category_id: "3",
    name: "Phở Bò Tái",
    name_en: "Pho with Rare Beef",
    description: "Phở nước trong với thịt bò tái mềm",
    description_en: "Clear pho broth with tender rare beef slices",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "7",
    category_id: "3",
    name: "Phở Bò Nạm",
    name_en: "Pho with Beef Brisket",
    description: "Phở với nạm bò mềm thấm vị",
    description_en: "Pho with tender, flavorful beef brisket",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "8",
    category_id: "3",
    name: "Phở Bò Bắp",
    name_en: "Pho with Beef Shank",
    description: "Phở với bắp bò giòn dai",
    description_en: "Pho with chewy beef shank",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 3,
    created_at: "",
    updated_at: "",
  },
  {
    id: "9",
    category_id: "3",
    name: "Phở Bò Viên",
    name_en: "Pho with Beef Meatballs",
    description: "Phở với bò viên tươi dai",
    description_en: "Pho with fresh, bouncy beef meatballs",
    price: 50000,
    image_url:
      "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 4,
    created_at: "",
    updated_at: "",
  },
  {
    id: "10",
    category_id: "3",
    name: "Phở Bò Sốt Vang",
    name_en: "Pho with Beef Stew",
    description: "Phở đặc biệt với bò sốt vang đậm đà",
    description_en: "Special pho with rich wine-braised beef",
    price: 65000,
    image_url:
      "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 5,
    created_at: "",
    updated_at: "",
  },
  {
    id: "11",
    category_id: "3",
    name: "Phở Gà",
    name_en: "Chicken Pho",
    description: "Phở gà nước trong vị thanh",
    description_en: "Light and clear chicken pho",
    price: 50000,
    image_url:
      "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 6,
    created_at: "",
    updated_at: "",
  },
  {
    id: "12",
    category_id: "4",
    name: "Bánh Mì Chả",
    name_en: "Banh Mi with Vietnamese Ham",
    description: "Bánh mì giòn với chả lụa",
    description_en: "Crispy baguette with Vietnamese ham",
    price: 25000,
    image_url:
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "13",
    category_id: "4",
    name: "Bánh Mì Xíu Mại",
    name_en: "Banh Mi with Meatballs",
    description: "Bánh mì xíu mại sốt cà",
    description_en: "Baguette with meatballs in tomato sauce",
    price: 30000,
    image_url:
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "14",
    category_id: "4",
    name: "Bánh Mì Thịt Nướng",
    name_en: "Banh Mi with Grilled Pork",
    description: "Bánh mì thịt heo nướng thơm",
    description_en: "Baguette with fragrant grilled pork",
    price: 30000,
    image_url:
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 3,
    created_at: "",
    updated_at: "",
  },
  {
    id: "15",
    category_id: "4",
    name: "Bánh Mì Gà Nướng",
    name_en: "Banh Mi with Grilled Chicken",
    description: "Bánh mì gà nướng sả ớt",
    description_en: "Baguette with lemongrass chili grilled chicken",
    price: 30000,
    image_url:
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 4,
    created_at: "",
    updated_at: "",
  },
  {
    id: "16",
    category_id: "4",
    name: "Bánh Mì Heo Quay",
    name_en: "Banh Mi with Roasted Pork",
    description: "Bánh mì heo quay da giòn",
    description_en: "Baguette with crispy skin roasted pork",
    price: 35000,
    image_url:
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 5,
    created_at: "",
    updated_at: "",
  },
  {
    id: "17",
    category_id: "4",
    name: "Bánh Mì Bò Nướng",
    name_en: "Banh Mi with Grilled Beef",
    description: "Bánh mì bò nướng lá lốt",
    description_en: "Baguette with betel leaf wrapped grilled beef",
    price: 35000,
    image_url:
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 6,
    created_at: "",
    updated_at: "",
  },
  {
    id: "18",
    category_id: "5",
    name: "Hủ Tiếu Nước",
    name_en: "Hu Tieu Soup",
    description: "Hủ tiếu nước lèo trong veo",
    description_en: "Clear soup hu tieu noodles",
    price: 50000,
    image_url:
      "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "19",
    category_id: "5",
    name: "Hủ Tiếu Bò Kho",
    name_en: "Hu Tieu with Beef Stew",
    description: "Hủ tiếu bò kho đậm đà",
    description_en: "Hu tieu noodles with rich beef stew",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "20",
    category_id: "5",
    name: "Hủ Tiếu Khô",
    name_en: "Dry Hu Tieu",
    description: "Hủ tiếu khô trộn mỡ hành",
    description_en: "Dry hu tieu with scallion oil",
    price: 50000,
    image_url:
      "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 3,
    created_at: "",
    updated_at: "",
  },
  {
    id: "21",
    category_id: "6",
    name: "Gỏi Cuốn",
    name_en: "Fresh Spring Rolls",
    description: "2 cuốn gỏi cuốn tôm thịt",
    description_en: "2 fresh spring rolls with shrimp and pork",
    price: 35000,
    image_url:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "22",
    category_id: "6",
    name: "Chả Giò",
    name_en: "Fried Spring Rolls",
    description: "4 cuốn chả giò giòn rụm",
    description_en: "4 crispy fried spring rolls",
    price: 35000,
    image_url:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "23",
    category_id: "6",
    name: "Xíu Mại Chén",
    name_en: "Steamed Meatballs",
    description: "Xíu mại hấp sốt cà chua",
    description_en: "Steamed meatballs in tomato sauce",
    price: 30000,
    image_url:
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 3,
    created_at: "",
    updated_at: "",
  },
  {
    id: "24",
    category_id: "6",
    name: "Bò Kho",
    name_en: "Beef Stew",
    description: "Bò kho đậm đà ăn kèm bánh mì",
    description_en: "Rich beef stew served with bread",
    price: 45000,
    image_url:
      "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 4,
    created_at: "",
    updated_at: "",
  },
  {
    id: "25",
    category_id: "6",
    name: "Gỏi Gà",
    name_en: "Chicken Salad",
    description: "Gỏi gà xé phay giòn ngon",
    description_en: "Shredded chicken salad",
    price: 40000,
    image_url:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 5,
    created_at: "",
    updated_at: "",
  },
  {
    id: "26",
    category_id: "6",
    name: "Gỏi Bò Tái Chanh",
    name_en: "Rare Beef Salad with Lime",
    description: "Bò tái chanh chua ngọt",
    description_en: "Sweet and sour lime-cured rare beef",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    ],
    is_available: true,
    sort_order: 6,
    created_at: "",
    updated_at: "",
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

interface OrderInterfaceProps {
  tableId: string;
  token: string;
}

export function OrderInterface({ tableId, token }: OrderInterfaceProps) {
  const { language, t } = useLanguage();
  const { name: restaurantName, logoUrl } = useRestaurantInfo();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNoteItem, setCurrentNoteItem] = useState<CartItem | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<MenuItem | null>(
    null,
  );
  const [addItemNote, setAddItemNote] = useState("");
  const [addItemQuantity, setAddItemQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenImageOpen, setFullscreenImageOpen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const swipeLocked = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tableName, setTableName] = useState(`Bàn ${tableId}`);
  const [resolvedTableId, setResolvedTableId] = useState(tableId);
  const [tableSessionToken, setTableSessionToken] = useState<string | null>(
    null,
  );
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return uuidv4();
    const storageKey = `order-session-${tableId}`;
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const newId = uuidv4();
    sessionStorage.setItem(storageKey, newId);
    return newId;
  });
  // Per-tab id (sessionStorage isolates between tabs but persists across reloads)
  // Used to skip our own realtime echoes. Must be per-tab so 2 tabs in the same
  // browser still see each other's cart updates.
  const [deviceId] = useState(() => {
    if (typeof window === "undefined") return uuidv4();
    const stored = sessionStorage.getItem("order-tab-id");
    if (stored) return stored;
    const id = uuidv4();
    sessionStorage.setItem("order-tab-id", id);
    return id;
  });
  const [cartHydrated, setCartHydrated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [orderedItems, setOrderedItems] = useState<
    Array<{
      orderId?: string;
      items: CartItem[];
      orderedAt: Date;
      total: number;
      status?: "new" | "preparing" | "ready" | "done" | "cancelled";
      cancellationReason?: string | null;
    }>
  >([]);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);

  // Get localized text for menu items
  const getItemName = (item: MenuItem) =>
    language === "en" && item.name_en ? item.name_en : item.name;
  const getItemDescription = (item: MenuItem) =>
    language === "en" && item.description_en
      ? item.description_en
      : item.description;
  const getCategoryName = (cat: Category) =>
    language === "en" && cat.name_en ? cat.name_en : cat.name;

  // Get all images for an item (combine image_url and images array)
  const getItemImages = (item: MenuItem): string[] => {
    const allImages: string[] = [];
    if (item.images && item.images.length > 0) {
      allImages.push(...item.images);
    } else if (item.image_url) {
      allImages.push(item.image_url);
    }
    return allImages;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        initBusinessDaySettings(supabase);

        // Try to fetch from Supabase
        const { data: categoriesData, error: catError } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order");

        const { data: menuData, error: menuError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("is_available", true)
          .order("sort_order");

        if (
          catError ||
          menuError ||
          !categoriesData?.length ||
          !menuData?.length
        ) {
          // Use demo data
          setIsDemo(true);
          setCategories(DEMO_CATEGORIES);
          setMenuItems(DEMO_MENU_ITEMS);
          setSelectedCategory(
            DEMO_CATEGORIES.find((c) => c.is_active !== false)?.id || null,
          );
          return;
        }

        setCategories(categoriesData);
        setMenuItems(menuData);
        const firstActive = (categoriesData as Category[]).find(
          (c) => c.is_active !== false,
        );
        setSelectedCategory(firstActive?.id || null);

        // Get table info incl current session_token
        if (token !== "demo") {
          const { data: rawTableData } = await supabase
            .from("tables")
            .select("id, name, table_number, session_token")
            .eq("qr_code_token", token)
            .single();

          const tableData = rawTableData as {
            id: string;
            name: string | null;
            table_number: number;
            session_token: string;
          } | null;

          if (tableData) {
            setTableName(tableData.name || `Bàn ${tableData.table_number}`);
            setResolvedTableId(tableData.id);
            setTableSessionToken(tableData.session_token);

            // Detect table-session change: if cashier cleared the table, the
            // session_token rotates. Reset local cart/history so customer sees
            // a fresh session on reload.
            const tokenStorageKey = `order-table-token-${tableData.id}`;
            const stored = sessionStorage.getItem(tokenStorageKey);
            if (stored && stored !== tableData.session_token) {
              sessionStorage.removeItem(`order-session-${tableId}`);
              sessionStorage.removeItem(`order-placed-${tableId}`);
              setOrderedItems([]);
              setCart([]);
              toast.info(
                language === "en"
                  ? "Table was cleared. Starting a new session."
                  : "Bàn đã được dọn. Bắt đầu phiên đặt món mới.",
              );
            }
            sessionStorage.setItem(tokenStorageKey, tableData.session_token);
          }
        }
      } catch {
        // Use demo data on error
        setIsDemo(true);
        setCategories(DEMO_CATEGORIES);
        setMenuItems(DEMO_MENU_ITEMS);
        setSelectedCategory(DEMO_CATEGORIES[0]?.id || null);
      }
    }

    loadData();
  }, [token]);

  // Load previous orders for this table session (resets after cashier clears table)
  useEffect(() => {
    async function loadPreviousOrders() {
      if (
        !tableSessionToken ||
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
        return;
      try {
        const supabase = createClient();
        const { data: prevOrders } = await supabase
          .from("orders")
          .select(
            `
            *,
            order_items(*, menu_item:menu_items(*))
          `,
          )
          .eq("session_token", tableSessionToken)
          .order("created_at", { ascending: false });

        const history = (prevOrders ?? []).map(
          (order: {
            id: string;
            status: "new" | "preparing" | "ready" | "done" | "cancelled";
            notes: string | null;
            order_items: Array<{
              quantity: number;
              unit_price: number;
              notes: string | null;
              menu_item: MenuItem | null;
            }>;
            created_at: string;
            total_amount: number;
          }) => {
            const reasonMatch = order.notes?.match(/^Lý do hủy:\s*(.+)/);
            return {
              orderId: order.id,
              items: order.order_items
                .filter((oi: { menu_item: MenuItem | null }) => oi.menu_item)
                .map(
                  (oi: {
                    quantity: number;
                    unit_price: number;
                    notes: string | null;
                    menu_item: MenuItem | null;
                  }) => ({
                    menuItem: oi.menu_item as MenuItem,
                    quantity: oi.quantity,
                    notes: oi.notes || "",
                  }),
                ),
              orderedAt: new Date(order.created_at),
              total: order.total_amount,
              status: order.status,
              cancellationReason:
                order.status === "cancelled" && reasonMatch
                  ? reasonMatch[1].split("\n")[0]
                  : null,
            };
          },
        );
        // Always set — clears state when the new session has no orders yet
        setOrderedItems(history);
      } catch (err) {
        console.error("Error loading previous orders:", err);
      }
    }
    loadPreviousOrders();
  }, [tableSessionToken]);

  // Realtime: live menu/category updates from admin (hide, delete, edit price...)
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }
    const supabase = createClient();
    async function refetchMenu() {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order");
      if (data) setMenuItems(data as MenuItem[]);
    }
    async function refetchCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (data) setCategories(data as Category[]);
    }
    const channel = supabase
      .channel("menu-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => refetchMenu(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => refetchCategories(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Realtime: any tab at this table sees newly-submitted orders instantly
  useEffect(() => {
    if (
      !tableSessionToken ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }
    const supabase = createClient();
    const channel = supabase
      .channel(`orders-${tableSessionToken}-${deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `session_token=eq.${tableSessionToken}`,
        },
        async (payload) => {
          const orderId = (payload.new as { id?: string })?.id;
          if (!orderId) return;
          // Skip if we already have this order (avoid duplicate from our own insert)
          let alreadyHave = false;
          setOrderedItems((prev) => {
            alreadyHave = prev.some((o) => o.orderId === orderId);
            return prev;
          });
          if (alreadyHave) return;
          // Fetch full row (realtime payload doesn't include joined order_items)
          const { data } = await supabase
            .from("orders")
            .select(`*, order_items(*, menu_item:menu_items(*))`)
            .eq("id", orderId)
            .single();
          if (!data) return;
          const order = data as {
            id: string;
            status: "new" | "preparing" | "ready" | "done" | "cancelled";
            notes: string | null;
            order_items: Array<{
              quantity: number;
              unit_price: number;
              notes: string | null;
              menu_item: MenuItem | null;
            }>;
            created_at: string;
            total_amount: number;
          };
          const reasonMatch = order.notes?.match(/^Lý do hủy:\s*(.+)/);
          const record = {
            orderId: order.id,
            items: order.order_items
              .filter((oi) => oi.menu_item)
              .map((oi) => ({
                menuItem: oi.menu_item as MenuItem,
                quantity: oi.quantity,
                notes: oi.notes || "",
              })),
            orderedAt: new Date(order.created_at),
            total: order.total_amount,
            status: order.status,
            cancellationReason:
              order.status === "cancelled" && reasonMatch
                ? reasonMatch[1].split("\n")[0]
                : null,
          };
          setOrderedItems((prev) =>
            prev.some((o) => o.orderId === order.id) ? prev : [record, ...prev],
          );
        },
      )
      .subscribe((status) => {
        console.log("[orders] subscribe status:", status);
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableSessionToken, deviceId]);

  // Realtime: when cashier presses "Dọn bàn", table.session_token rotates.
  // Detect the rotation and reset local cart + history immediately.
  useEffect(() => {
    if (
      !resolvedTableId ||
      !tableSessionToken ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }
    const supabase = createClient();
    const channel = supabase
      .channel(`table-session-${resolvedTableId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tables",
          filter: `id=eq.${resolvedTableId}`,
        },
        (payload) => {
          const row = payload.new as { session_token?: string } | undefined;
          const newToken = row?.session_token;
          if (!newToken || newToken === tableSessionToken) return;
          // Cashier cleared the table: reset all local order state
          setCart([]);
          setOrderedItems([]);
          lastSyncedSnapshotRef.current = "[]";
          sessionStorage.removeItem(`order-session-${tableId}`);
          sessionStorage.removeItem(`order-placed-${tableId}`);
          sessionStorage.setItem(
            `order-table-token-${resolvedTableId}`,
            newToken,
          );
          setTableSessionToken(newToken);
          toast.info(
            language === "en"
              ? "Table was cleared by staff. Starting a new session."
              : "Bàn đã được dọn. Bắt đầu phiên đặt món mới.",
            { duration: 6000 },
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [resolvedTableId, tableSessionToken, tableId, language]);

  // Last cart snapshot we know is in sync with the server.
  // Used to skip both upserts (no-op writes) and realtime echoes (we already
  // have this state). Independent of deviceId so it can't false-negative.
  const lastSyncedSnapshotRef = useRef<string>("[]");

  // Mirror of orderedItems for stable access inside long-lived realtime closures.
  // Status-change broadcasts apply to ALL tabs at the table (not just the one
  // that submitted the order), so we match by order_id against this ref.
  const orderedItemsRef = useRef<typeof orderedItems>([]);
  useEffect(() => {
    orderedItemsRef.current = orderedItems;
  }, [orderedItems]);

  function serializeCart(items: CartItem[]): string {
    return JSON.stringify(
      items.map((c) => ({
        id: c.menuItem.id,
        q: c.quantity,
        n: c.notes || "",
      })),
    );
  }

  function serializeRaw(
    items: Array<{ menu_item_id: string; quantity: number; notes: string }>,
  ): string {
    return JSON.stringify(
      items.map((it) => ({
        id: it.menu_item_id,
        q: it.quantity,
        n: it.notes || "",
      })),
    );
  }

  // Hydrate shared cart from DB once menu items + session are ready
  useEffect(() => {
    async function hydrateCart() {
      if (
        !tableSessionToken ||
        menuItems.length === 0 ||
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        return;
      }
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("table_carts")
          .select("items")
          .eq("session_token", tableSessionToken)
          .maybeSingle();
        const raw =
          (
            data as {
              items?: Array<{
                menu_item_id: string;
                quantity: number;
                notes: string;
              }>;
            } | null
          )?.items ?? [];
        const menuMap = new Map(menuItems.map((m) => [m.id, m]));
        const hydrated = raw
          .map((it) => {
            const mi = menuMap.get(it.menu_item_id);
            return mi
              ? { menuItem: mi, quantity: it.quantity, notes: it.notes || "" }
              : null;
          })
          .filter((x): x is CartItem => x !== null);
        lastSyncedSnapshotRef.current = serializeCart(hydrated);
        if (hydrated.length > 0) setCart(hydrated);
      } catch (err) {
        console.error("Error hydrating cart:", err);
      } finally {
        setCartHydrated(true);
      }
    }
    hydrateCart();
  }, [tableSessionToken, menuItems]);

  // Subscribe to remote cart changes
  useEffect(() => {
    if (
      !tableSessionToken ||
      menuItems.length === 0 ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }
    const supabase = createClient();
    // Unique channel name per tab so each tab gets its own subscription
    const channel = supabase
      .channel(`cart-${tableSessionToken}-${deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "table_carts",
          filter: `session_token=eq.${tableSessionToken}`,
        },
        (payload) => {
          console.log("[cart] realtime event:", payload.eventType, payload);
          const row = payload.new as
            | {
                items: Array<{
                  menu_item_id: string;
                  quantity: number;
                  notes: string;
                }>;
              }
            | undefined;
          if (!row) return;
          const incomingItems = row.items || [];
          const incomingSnapshot = serializeRaw(incomingItems);
          if (incomingSnapshot === lastSyncedSnapshotRef.current) {
            console.log("[cart] echo matches snapshot, skip");
            return;
          }
          const menuMap = new Map(menuItems.map((m) => [m.id, m]));
          const next = incomingItems
            .map((it) => {
              const mi = menuMap.get(it.menu_item_id);
              return mi
                ? {
                    menuItem: mi,
                    quantity: it.quantity,
                    notes: it.notes || "",
                  }
                : null;
            })
            .filter((x): x is CartItem => x !== null);
          console.log("[cart] applying remote update, items:", next.length);
          lastSyncedSnapshotRef.current = serializeCart(next);
          setCart(next);
        },
      )
      .subscribe((status, err) => {
        console.log("[cart] subscribe status:", status, err);
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableSessionToken, menuItems, deviceId]);

  // Persist cart to DB (debounced) only when it actually differs from server
  useEffect(() => {
    if (
      !tableSessionToken ||
      !cartHydrated ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }
    const localSnapshot = serializeCart(cart);
    if (localSnapshot === lastSyncedSnapshotRef.current) return;
    const handle = setTimeout(async () => {
      try {
        const supabase = createClient();
        // Capture what we're about to send — if it's still current at write
        // time, mark it as the synced snapshot so the echo gets suppressed.
        const sending = serializeCart(cart);
        await supabase.from("table_carts").upsert(
          {
            session_token: tableSessionToken,
            items: cart.map((c) => ({
              menu_item_id: c.menuItem.id,
              quantity: c.quantity,
              notes: c.notes || "",
            })),
            updated_by: deviceId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "session_token" },
        );
        lastSyncedSnapshotRef.current = sending;
      } catch (err) {
        console.error("Error syncing cart:", err);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [cart, tableSessionToken, cartHydrated, deviceId]);

  // Listen for order status changes from cashier
  useEffect(() => {
    if (
      !sessionId ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
      return;

    const supabase = createClient();
    const statusLabels: Record<string, { vi: string; en: string }> = {
      preparing: {
        vi: "🍳 Đơn hàng đang được chuẩn bị!",
        en: "🍳 Your order is being prepared!",
      },
      ready: {
        vi: "✅ Món đã sẵn sàng! Vui lòng lấy món.",
        en: "✅ Your order is ready! Please pick it up.",
      },
      done: {
        vi: "🎉 Đơn hàng hoàn thành. Cảm ơn!",
        en: "🎉 Order completed. Thank you!",
      },
      cancelled: {
        vi: "❌ Đơn hàng đã bị hủy.",
        en: "❌ Your order has been cancelled.",
      },
    };

    const channel = supabase
      .channel("order-status")
      .on("broadcast", { event: "status-change" }, (message) => {
        const { new_status, reason, order_id } = message.payload;
        if (!order_id) return;
        // Apply to any tab at the same table that has this order in its
        // history — matches by order_id, not the per-tab session_id.
        const isOurs = orderedItemsRef.current.some(
          (o) => o.orderId === order_id,
        );
        if (!isOurs) return;

        const label = statusLabels[new_status];
        if (label) {
          const baseMsg = language === "en" ? label.en : label.vi;
          if (new_status === "cancelled") {
            const reasonText = reason
              ? `\n${language === "en" ? "Reason" : "Lý do"}: ${reason}`
              : "";
            toast.error(`${baseMsg}${reasonText}`, {
              duration: 15000,
              style: { whiteSpace: "pre-line" },
            });
          } else {
            toast.info(baseMsg, { duration: 6000 });
          }
        }
        setOrderedItems((prev) =>
          prev.map((o) =>
            o.orderId === order_id
              ? {
                  ...o,
                  status: new_status,
                  cancellationReason: reason || null,
                }
              : o,
          ),
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, language]);

  // Active categories only — hidden ones disappear from the menu
  const visibleCategories = useMemo(
    () => categories.filter((c) => c.is_active !== false),
    [categories],
  );
  const visibleCategoryIds = useMemo(
    () => new Set(visibleCategories.map((c) => c.id)),
    [visibleCategories],
  );

  // Auto-clean cart when admin hides/deletes items or categories.
  // Runs whenever menuItems or categories change (incl. via realtime).
  useEffect(() => {
    const validIds = new Set(
      menuItems
        .filter(
          (it) =>
            it.is_available &&
            it.category_id != null &&
            visibleCategoryIds.has(it.category_id),
        )
        .map((it) => it.id),
    );
    setCart((prev) => {
      const invalid = prev.filter((c) => !validIds.has(c.menuItem.id));
      if (invalid.length === 0) return prev;
      const names = invalid.map((i) => getItemName(i.menuItem)).join(", ");
      toast.warning(
        language === "en"
          ? `Removed unavailable items from cart: ${names}`
          : `Đã bỏ món không còn trong giỏ: ${names}`,
        { duration: 8000 },
      );
      return prev.filter((c) => validIds.has(c.menuItem.id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems, visibleCategoryIds]);

  const filteredItems = useMemo(() => {
    // Filter out unavailable items + items in hidden categories
    let items = menuItems.filter(
      (item) =>
        item.is_available &&
        item.category_id != null &&
        visibleCategoryIds.has(item.category_id),
    );

    if (selectedCategory) {
      items = items.filter((item) => item.category_id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.name_en?.toLowerCase().includes(query),
      );
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery, visibleCategoryIds]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0,
    );
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  function openAddItemDialog(menuItem: MenuItem) {
    setSelectedItemToAdd(menuItem);
    setAddItemNote("");
    setAddItemQuantity(1);
    setCurrentImageIndex(0);
    setAddItemDialogOpen(true);
  }

  function confirmAddToCart() {
    if (!selectedItemToAdd) return;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.menuItem.id === selectedItemToAdd.id,
      );
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === selectedItemToAdd.id
            ? {
                ...item,
                quantity: item.quantity + addItemQuantity,
                notes: addItemNote || item.notes,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          menuItem: selectedItemToAdd,
          quantity: addItemQuantity,
          notes: addItemNote,
        },
      ];
    });
    toast.success(`${t("added")} ${getItemName(selectedItemToAdd)}`);
    setAddItemDialogOpen(false);
    setSelectedItemToAdd(null);
  }

  function updateQuantity(itemId: string, delta: number) {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menuItem.id === itemId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== itemId));
  }

  function openNoteDialog(item: CartItem) {
    setCurrentNoteItem(item);
    setTempNote(item.notes);
    setNoteDialogOpen(true);
  }

  function saveNote() {
    if (currentNoteItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.menuItem.id === currentNoteItem.menuItem.id
            ? { ...item, notes: tempNote }
            : item,
        ),
      );
    }
    setNoteDialogOpen(false);
    setCurrentNoteItem(null);
    setTempNote("");
  }

  async function submitOrder() {
    if (cart.length === 0) {
      toast.error(t("cartIsEmpty"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to order history before clearing cart
      const orderRecord = {
        items: [...cart],
        orderedAt: new Date(),
        total: cartTotal,
        status: "new" as const,
      };

      if (isDemo) {
        // Simulate order submission in demo mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setOrderedItems((prev) => [orderRecord, ...prev]);
        setOrderPlaced(true);
        setCart([]);
        toast.success(t("orderSentDemo"));
        return;
      }

      const supabase = createClient();

      // Validate against latest menu state — admin may have hidden/deleted
      // items or categories since the customer added them to cart.
      const itemIds = cart.map((c) => c.menuItem.id);
      const [itemsRes, catsRes] = await Promise.all([
        supabase
          .from("menu_items")
          .select("id, name, is_available, category_id")
          .in("id", itemIds),
        supabase.from("categories").select("id, is_active"),
      ]);
      const currentItems = (itemsRes.data ?? []) as Array<{
        id: string;
        is_available: boolean;
        category_id: string | null;
      }>;
      const currentCats = (catsRes.data ?? []) as Array<{
        id: string;
        is_active: boolean;
      }>;
      const activeCatIds = new Set(
        currentCats.filter((c) => c.is_active !== false).map((c) => c.id),
      );
      const validIds = new Set(
        currentItems
          .filter(
            (it) =>
              it.is_available &&
              it.category_id != null &&
              activeCatIds.has(it.category_id),
          )
          .map((it) => it.id),
      );
      const invalid = cart.filter((c) => !validIds.has(c.menuItem.id));
      if (invalid.length > 0) {
        const names = invalid.map((i) => getItemName(i.menuItem)).join(", ");
        toast.error(
          language === "en"
            ? `These items are no longer available: ${names}. Please choose other items.`
            : `Món không còn tồn tại: ${names}. Vui lòng đặt món khác.`,
          { duration: 8000 },
        );
        // Auto-remove invalid items so customer can re-submit immediately
        setCart((prev) => prev.filter((c) => validIds.has(c.menuItem.id)));
        setIsSubmitting(false);
        return;
      }

      // Create order
      console.log("Submitting order:", {
        table_id: resolvedTableId,
        session_id: sessionId,
        total: cartTotal,
      });
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_id: resolvedTableId,
          session_id: sessionId,
          session_token: tableSessionToken,
          status: "new",
          total_amount: cartTotal,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order insert error:", orderError);
        throw orderError;
      }
      console.log("Order created:", order.id);

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Broadcast to cashier via Supabase Realtime channel
      const channel = supabase.channel("new-orders");
      await channel.subscribe();
      await channel.send({
        type: "broadcast",
        event: "new-order",
        payload: {
          order_id: order.id,
          table_id: resolvedTableId,
          table_name: tableName,
          total: cartTotal,
        },
      });
      supabase.removeChannel(channel);

      setOrderedItems((prev) => [
        { ...orderRecord, orderId: (order as { id: string }).id },
        ...prev,
      ]);
      setOrderPlaced(true);
      setCart([]);
      toast.success(t("orderSent"));
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(t("orderFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Image carousel navigation with slide animation
  function goToImage(index: number) {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  }

  function nextImage() {
    if (!selectedItemToAdd) return;
    const images = getItemImages(selectedItemToAdd);
    goToImage((currentImageIndex + 1) % images.length);
  }

  function prevImage() {
    if (!selectedItemToAdd) return;
    const images = getItemImages(selectedItemToAdd);
    goToImage((currentImageIndex - 1 + images.length) % images.length);
  }

  // Touch swipe handlers — follows finger in real-time, then snaps
  function handleTouchStart(e: React.TouchEvent) {
    if (isAnimating) return;
    swipeLocked.current = false;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    setSwipeOffset(0);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchStartRef.current || !selectedItemToAdd) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    // Lock direction on first significant movement
    if (!swipeLocked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      swipeLocked.current = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical scroll — bail out
        touchStartRef.current = null;
        return;
      }
    }
    if (swipeLocked.current) {
      e.preventDefault();
      const images = getItemImages(selectedItemToAdd);
      // Add resistance at edges
      const atEdge = (dx > 0 && currentImageIndex === 0) ||
        (dx < 0 && currentImageIndex === images.length - 1);
      setSwipeOffset(atEdge ? dx * 0.3 : dx);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current || !selectedItemToAdd) {
      setSwipeOffset(0);
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const velocity = absDx / Math.max(elapsed, 1);
    const images = getItemImages(selectedItemToAdd);

    // Threshold: 1/4 of width OR fast flick (velocity > 0.5px/ms)
    const threshold = (e.currentTarget as HTMLElement).offsetWidth / 4;
    const shouldSwipe = images.length > 1 && absDx > absDy && (absDx > threshold || velocity > 0.5);

    if (shouldSwipe) {
      if (dx < 0 && currentImageIndex < images.length - 1) {
        nextImage();
      } else if (dx > 0 && currentImageIndex > 0) {
        prevImage();
      }
    } else if (absDx < 10 && absDy < 10 && elapsed < 300) {
      // Tap — open fullscreen
      if (images.length > 0) setFullscreenImageOpen(true);
    }

    setSwipeOffset(0);
    touchStartRef.current = null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("orderSuccess")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("orderSentToCashier")}
            </p>
            <Button onClick={() => setOrderPlaced(false)} className="w-full">
              {t("orderMore")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={restaurantName}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground truncate">
                {restaurantName}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                {isDemo && (
                  <Badge variant="secondary" className="text-xs">
                    Demo
                  </Badge>
                )}
                <span className="font-medium text-foreground">{tableName}</span>
                <span>•</span>
                <span>{t("selectDishesToAdd")}</span>
              </p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchDishes")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Categories */}
        <div className="mt-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2 w-max">
            {visibleCategories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {getCategoryName(category)}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <main className="p-4">
        <div className="grid gap-3">
          {filteredItems.map((item) => {
            const images = getItemImages(item);
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => openAddItemDialog(item)}
                    className="w-full flex text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                  >
                    {/* Food Image */}
                    <div className="w-28 h-28 shrink-0 bg-muted relative overflow-hidden">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={getItemName(item)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&q=80";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full relative">
                          <img
                            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&q=80"
                            alt="Food placeholder"
                            className="w-full h-full object-cover opacity-40"
                            crossOrigin="anonymous"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <UtensilsCrossed className="w-8 h-8 text-muted-foreground/70" />
                          </div>
                        </div>
                      )}
                      {images.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          +{images.length - 1}
                        </div>
                      )}
                    </div>

                    {/* Food Info */}
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-medium text-foreground leading-tight">
                          {getItemName(item)}
                        </h3>
                        {language === "vi" && item.name_en && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.name_en}
                          </p>
                        )}
                        {getItemDescription(item) && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {getItemDescription(item)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-primary font-semibold">
                          {formatPrice(item.price)}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {t("tapToOrder")}
                        </span>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">{t("searchDishes")}</p>
          </div>
        )}
      </main>

      {/* Bottom Buttons - Cart and History */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex gap-2">
          {/* Order History Button */}
          <Sheet open={historySheetOpen} onOpenChange={setHistorySheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-4"
                disabled={orderedItems.length === 0}
              >
                <History className="w-5 h-5" />
                {orderedItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {orderedItems.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh]">
              <SheetHeader>
                <SheetTitle>{t("orderedItems")}</SheetTitle>
              </SheetHeader>

              {orderedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <History className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">{t("noOrderedItems")}</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 min-h-0 overflow-y-auto px-6">
                  <div className="space-y-6 py-4">
                    {orderedItems.map((order, orderIndex) => {
                      const statusConfig: Record<
                        string,
                        { label: { vi: string; en: string }; cls: string }
                      > = {
                        new: {
                          label: { vi: "Đơn mới", en: "New" },
                          cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                        },
                        preparing: {
                          label: { vi: "Đang chuẩn bị", en: "Preparing" },
                          cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
                        },
                        ready: {
                          label: { vi: "Sẵn sàng", en: "Ready" },
                          cls: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
                        },
                        done: {
                          label: { vi: "Hoàn thành", en: "Done" },
                          cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                        },
                        cancelled: {
                          label: { vi: "Đã hủy", en: "Cancelled" },
                          cls: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
                        },
                      };
                      const status = order.status || "new";
                      const cfg = statusConfig[status];
                      return (
                        <div
                          key={order.orderId || orderIndex}
                          className={`space-y-3 ${status === "cancelled" ? "opacity-70" : ""}`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>
                                {t("orderedAt")}:{" "}
                                {order.orderedAt.toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}
                              >
                                {language === "en"
                                  ? cfg.label.en
                                  : cfg.label.vi}
                              </span>
                              <span
                                className={`font-semibold ${status === "cancelled" ? "text-muted-foreground line-through" : "text-primary"}`}
                              >
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>
                          {status === "cancelled" &&
                            order.cancellationReason && (
                              <div className="text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2 text-red-700 dark:text-red-300 break-words">
                                <span className="font-medium">
                                  {language === "en" ? "Reason" : "Lý do hủy"}:
                                </span>{" "}
                                {order.cancellationReason}
                              </div>
                            )}
                          <div className="space-y-2">
                            {order.items.map((item, itemIndex) => {
                              const images = getItemImages(item.menuItem);
                              return (
                                <div
                                  key={itemIndex}
                                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                                >
                                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                    {images.length > 0 ? (
                                      <img
                                        src={images[0]}
                                        alt={getItemName(item.menuItem)}
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">
                                      {getItemName(item.menuItem)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.quantity} x{" "}
                                      {formatPrice(item.menuItem.price)}
                                    </p>
                                    {item.notes && (
                                      <p className="text-xs text-muted-foreground italic mt-0.5 break-words line-clamp-2">
                                        {t("noteFor")}: {item.notes}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      openAddItemDialog(item.menuItem);
                                      setHistorySheetOpen(false);
                                    }}
                                  >
                                    {t("reorder")}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                          {orderIndex < orderedItems.length - 1 && (
                            <Separator />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </SheetContent>
          </Sheet>

          {/* Cart Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="flex-1 h-14 text-base" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t("cart")} ({cartItemCount})
                <span className="ml-auto font-bold">
                  {formatPrice(cartTotal)}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh]">
              <SheetHeader>
                <SheetTitle>{t("yourCart")}</SheetTitle>
              </SheetHeader>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">{t("cartEmpty")}</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 min-h-0 overflow-y-auto px-6">
                    <div className="space-y-4 py-4">
                      {cart.map((item) => {
                        const images = getItemImages(item.menuItem);
                        return (
                          <div key={item.menuItem.id} className="space-y-2">
                            <div className="flex items-start gap-3">
                              {/* Cart Item Image */}
                              <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                                {images.length > 0 ? (
                                  <img
                                    src={images[0]}
                                    alt={getItemName(item.menuItem)}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground text-sm">
                                  {getItemName(item.menuItem)}
                                </h4>
                                <p className="text-sm text-primary">
                                  {formatPrice(item.menuItem.price)}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic break-words line-clamp-2">
                                    {t("noteFor")}: {item.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(item.menuItem.id, -1)
                                  }
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(item.menuItem.id, 1)
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex gap-2 pl-17">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => openNoteDialog(item)}
                              >
                                {item.notes ? t("editNote") : t("addNote")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-destructive"
                                onClick={() => removeFromCart(item.menuItem.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                {t("delete")}
                              </Button>
                            </div>
                            <Separator />
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="border-t pt-4 space-y-4 mx-6 mb-6">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>{t("total")}</span>
                      <span className="text-primary">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <Button
                      className="w-full h-14 text-base relative overflow-hidden"
                      size="lg"
                      onClick={submitOrder}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            className="w-5 h-5 mr-2 animate-spin"
                            strokeWidth={2.5}
                          />
                          {t("placing")}
                          {/* Subtle progress shimmer */}
                          <span
                            aria-hidden
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.4s_ease-in-out_infinite]"
                          />
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          {t("placeOrder")}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("noteFor")}{" "}
              {currentNoteItem ? getItemName(currentNoteItem.menuItem) : ""}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={t("notePlaceholder")}
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value.slice(0, 200))}
            rows={3}
            maxLength={200}
            className="resize-none max-h-32 overflow-y-auto"
          />
          <div className="text-xs text-muted-foreground text-right -mt-2">
            {tempNote.length}/200
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={saveNote}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog with Large Image Carousel */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent
          className="max-w-lg p-0 overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedItemToAdd
                ? getItemName(selectedItemToAdd)
                : t("addToCart")}
            </DialogTitle>
          </DialogHeader>
          {selectedItemToAdd && (
            <>
              {/* Large Image Carousel */}
              <div
                className="relative w-full aspect-[4/3] bg-muted overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {(() => {
                  const images = getItemImages(selectedItemToAdd);
                  if (images.length > 0) {
                    return (
                      <>
                        <div
                          className="flex h-full"
                          style={{
                            transform: `translateX(calc(-${currentImageIndex * 100}% + ${swipeOffset}px))`,
                            transition: swipeOffset !== 0 ? 'none' : 'transform 300ms ease-out',
                            willChange: 'transform',
                          }}
                        >
                          {images.map((src, idx) => (
                            <img
                              key={src}
                              src={src}
                              alt={`${getItemName(selectedItemToAdd)} ${idx + 1}`}
                              className="w-full h-full object-cover shrink-0 cursor-pointer"
                              crossOrigin="anonymous"
                              style={{ minWidth: '100%' }}
                              role="button"
                              tabIndex={idx === currentImageIndex ? 0 : -1}
                              onClick={() => setFullscreenImageOpen(true)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") setFullscreenImageOpen(true);
                              }}
                            />
                          ))}
                        </div>
                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                            {/* Dots Indicator */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {images.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentImageIndex(idx)}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    idx === currentImageIndex
                                      ? "bg-white"
                                      : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    );
                  }
                  return (
                    <div className="w-full h-full relative">
                      <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop&q=80"
                        alt="Food placeholder"
                        className="w-full h-full object-cover opacity-50"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <UtensilsCrossed className="w-16 h-16 text-muted-foreground/70" />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Item Details */}
              <div className="p-4 space-y-4 pb-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {getItemName(selectedItemToAdd)}
                  </h3>
                  {language === "vi" && selectedItemToAdd.name_en && (
                    <p className="text-sm text-muted-foreground">
                      {selectedItemToAdd.name_en}
                    </p>
                  )}
                  {getItemDescription(selectedItemToAdd) && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {getItemDescription(selectedItemToAdd)}
                    </p>
                  )}
                  <p className="text-xl text-primary font-bold mt-2">
                    {formatPrice(selectedItemToAdd.price)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("quantity")}</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setAddItemQuantity(Math.max(1, addItemQuantity - 1))
                      }
                      disabled={addItemQuantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg">
                      {addItemQuantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAddItemQuantity(addItemQuantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("noteOptional")}
                  </label>
                  <Textarea
                    placeholder={t("notePlaceholder")}
                    value={addItemNote}
                    onChange={(e) =>
                      setAddItemNote(e.target.value.slice(0, 200))
                    }
                    rows={2}
                    maxLength={200}
                    className="resize-none max-h-24 overflow-y-auto"
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {addItemNote.length}/200
                  </div>
                </div>

                {/* Total and Add Button */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("subtotal")}
                    </span>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(selectedItemToAdd.price * addItemQuantity)}
                    </p>
                  </div>
                  <Button onClick={confirmAddToCart} size="lg" className="px-8">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addToCart")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Viewer */}
      {selectedItemToAdd && fullscreenImageOpen && (() => {
        const images = getItemImages(selectedItemToAdd);
        return (
          <Dialog open={fullscreenImageOpen} onOpenChange={setFullscreenImageOpen}>
            <DialogContent
              className="max-w-none w-screen h-screen p-0 border-none bg-black/95 rounded-none"
              showCloseButton={true}
            >
              <DialogHeader className="sr-only">
                <DialogTitle>{getItemName(selectedItemToAdd)}</DialogTitle>
              </DialogHeader>
              <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex w-full h-full items-center"
                  style={{
                    transform: `translateX(calc(-${currentImageIndex * 100}% + ${swipeOffset}px))`,
                    transition: swipeOffset !== 0 ? 'none' : 'transform 300ms ease-out',
                    willChange: 'transform',
                  }}
                >
                  {images.map((src, idx) => (
                    <div key={src} className="shrink-0 w-full h-full flex items-center justify-center" style={{ minWidth: '100%' }}>
                      <img
                        src={src}
                        alt={`${getItemName(selectedItemToAdd)} ${idx + 1}`}
                        className="max-w-full max-h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>
                  ))}
                </div>
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                {/* Dots + Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <span className="text-white/80 text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                    <div className="flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            idx === currentImageIndex
                              ? "bg-white"
                              : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
