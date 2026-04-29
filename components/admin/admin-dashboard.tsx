"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  getBusinessDayRange,
  getBusinessDayRangeAgo,
  getResetHour,
  initBusinessDaySettings,
  setResetHour,
} from "@/lib/business-day";
import {
  getRestaurantName,
  getLogoUrl,
  initRestaurantSettings,
  setRestaurantInfo,
} from "@/lib/restaurant-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Settings,
  Home,
  BarChart3,
  UtensilsCrossed,
  LayoutGrid,
  History,
  Plus,
  Pencil,
  Trash2,
  QrCode,
  Download,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  ImageIcon,
  X,
  MoreVertical,
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type {
  Category,
  MenuItem,
  Table as TableType,
  Order,
} from "@/lib/supabase/types";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";

// Demo data
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
    description: "Cơm tấm đặc trưng Sài Gòn với sườn nướng, bì và chả",
    description_en: "Saigon-style broken rice with grilled pork chop",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400",
    images: [
      "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400",
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
    description: "Cơm gà kiểu Hội An với gà xé phay và nước mắm đặc biệt",
    description_en: "Hoi An style chicken rice",
    price: 50000,
    image_url:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
    images: [
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
    ],
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    category_id: "2",
    name: "Bún Thịt Nướng",
    name_en: "Vermicelli with Grilled Pork",
    description: "Bún tươi với thịt heo nướng thơm, rau sống",
    description_en: "Rice vermicelli with grilled pork and fresh vegetables",
    price: 45000,
    image_url:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
    images: [
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "4",
    category_id: "2",
    name: "Bún Bò Huế",
    name_en: "Hue Beef Noodle Soup",
    description: "Bún bò Huế đậm đà với nước lèo cay nồng",
    description_en: "Spicy beef noodle soup from Hue",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=400",
    images: [
      "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=400",
    ],
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "5",
    category_id: "3",
    name: "Phở Bò Tái",
    name_en: "Pho with Rare Beef",
    description: "Phở nước trong với thịt bò tái mềm",
    description_en: "Traditional pho with rare beef slices",
    price: 55000,
    image_url:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
    images: [
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "6",
    category_id: "3",
    name: "Phở Gà",
    name_en: "Chicken Pho",
    description: "Phở gà nước trong vị thanh",
    description_en: "Chicken pho with clear broth",
    price: 50000,
    image_url: null,
    images: null,
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "7",
    category_id: "4",
    name: "Bánh Mì Thịt Nướng",
    name_en: "Banh Mi with Grilled Pork",
    description: "Bánh mì giòn với thịt heo nướng",
    description_en: "Crispy baguette with grilled pork",
    price: 30000,
    image_url:
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=400",
    images: [
      "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=400",
    ],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "8",
    category_id: "4",
    name: "Bánh Mì Chả",
    name_en: "Banh Mi with Vietnamese Ham",
    description: "Bánh mì với chả lua truyền thống",
    description_en: "Baguette with Vietnamese ham",
    price: 25000,
    image_url: null,
    images: null,
    is_available: false,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "9",
    category_id: "6",
    name: "Gỏi Cuốn",
    name_en: "Fresh Spring Rolls",
    description: "2 cuốn gỏi cuốn tôm thịt với nước chấm",
    description_en: "2 fresh spring rolls with peanut sauce",
    price: 35000,
    image_url:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947?w=400"],
    is_available: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "10",
    category_id: "6",
    name: "Chả Giò",
    name_en: "Fried Spring Rolls",
    description: "4 cuốn chả giò giòn rụm",
    description_en: "4 crispy fried spring rolls",
    price: 35000,
    image_url: null,
    images: null,
    is_available: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
];

const DEMO_TABLES: TableType[] = [
  {
    id: "1",
    table_number: 1,
    name: "Bàn 1",
    capacity: 4,
    is_active: true,
    qr_code_token: "token-1",
    session_token: "session-1",
    session_started_at: new Date().toISOString(),
    created_at: "",
  },
  {
    id: "2",
    table_number: 2,
    name: "Bàn 2",
    capacity: 4,
    is_active: true,
    qr_code_token: "token-2",
    session_token: "session-2",
    session_started_at: new Date().toISOString(),
    created_at: "",
  },
  {
    id: "3",
    table_number: 3,
    name: "Bàn 3",
    capacity: 6,
    is_active: true,
    qr_code_token: "token-3",
    session_token: "session-3",
    session_started_at: new Date().toISOString(),
    created_at: "",
  },
  {
    id: "4",
    table_number: 4,
    name: "Bàn 4",
    capacity: 4,
    is_active: true,
    qr_code_token: "token-4",
    session_token: "session-4",
    session_started_at: new Date().toISOString(),
    created_at: "",
  },
  {
    id: "5",
    table_number: 5,
    name: "Bàn 5",
    capacity: 2,
    is_active: true,
    qr_code_token: "token-5",
    session_token: "session-5",
    session_started_at: new Date().toISOString(),
    created_at: "",
  },
  {
    id: "6",
    table_number: 6,
    name: "Bàn 6",
    capacity: 8,
    is_active: true,
    qr_code_token: "token-6",
    session_token: "session-6",
    session_started_at: new Date().toISOString(),
    created_at: "",
  },
];

const DEMO_ORDERS: Order[] = [
  {
    id: "1",
    table_id: "1",
    session_id: "s1",
    status: "done",
    total_amount: 110000,
    notes: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: "",
  },
  {
    id: "2",
    table_id: "3",
    session_id: "s2",
    status: "done",
    total_amount: 145000,
    notes: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: "",
  },
  {
    id: "3",
    table_id: "5",
    session_id: "s3",
    status: "done",
    total_amount: 60000,
    notes: null,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: "",
  },
  {
    id: "4",
    table_id: "2",
    session_id: "s4",
    status: "done",
    total_amount: 200000,
    notes: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: "",
  },
  {
    id: "5",
    table_id: "4",
    session_id: "s5",
    status: "done",
    total_amount: 175000,
    notes: null,
    created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
    updated_at: "",
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [chartPeriod, setChartPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("week");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartOrders, setChartOrders] = useState<Order[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [resetHourInput, setResetHourInput] = useState<string>("5");
  const [savingSettings, setSavingSettings] = useState(false);
  const [restaurantNameInput, setRestaurantNameInput] = useState<string>("");
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [savingRestaurantInfo, setSavingRestaurantInfo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<
    | (Order & {
        order_items: Array<{
          id: string;
          quantity: number;
          unit_price: number;
          notes: string | null;
          menu_item: MenuItem | null;
        }>;
      })
    | null
  >(null);
  const [isLoadingHistoryDetail, setIsLoadingHistoryDetail] = useState(false);

  // Sync input with current cached value on mount
  useEffect(() => {
    setResetHourInput(String(getResetHour()));
    setRestaurantNameInput(getRestaurantName());
    setLogoUrlState(getLogoUrl());
  }, []);

  async function saveResetHour() {
    const n = Number(resetHourInput);
    if (!Number.isFinite(n) || n < 0 || n >= 24) {
      toast.error("Giờ phải từ 0 đến 23");
      return;
    }
    setSavingSettings(true);
    try {
      await setResetHour(createClient(), n);
      toast.success("Đã lưu. Tải lại trang để áp dụng toàn bộ.");
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      toast.error(`Không thể lưu: ${message}`);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setLogoUrlState(json.url);
      toast.success("Tải logo thành công. Bấm Lưu để áp dụng.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      toast.error(`Không thể tải logo: ${msg}`);
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function openHistoryDetail(order: Order) {
    setIsLoadingHistoryDetail(true);
    setSelectedHistoryOrder({ ...order, order_items: [] });
    if (isDemo) {
      setIsLoadingHistoryDetail(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select(`*, order_items(*, menu_item:menu_items(*))`)
        .eq("id", order.id)
        .single();
      if (data) {
        setSelectedHistoryOrder(
          data as typeof selectedHistoryOrder extends infer T
            ? Exclude<T, null>
            : never,
        );
      }
    } catch (err) {
      console.error("Error loading order detail:", err);
      toast.error("Không thể tải chi tiết đơn");
    } finally {
      setIsLoadingHistoryDetail(false);
    }
  }

  async function saveRestaurantInfo() {
    const name = restaurantNameInput.trim();
    if (!name) {
      toast.error("Tên quán không được để trống");
      return;
    }
    setSavingRestaurantInfo(true);
    try {
      await setRestaurantInfo(createClient(), { name, logoUrl });
      toast.success("Đã lưu thông tin quán");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      toast.error(`Không thể lưu: ${msg}`);
    } finally {
      setSavingRestaurantInfo(false);
    }
  }

  // Dialog states
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [menuForm, setMenuForm] = useState({
    name: "",
    name_en: "",
    description: "",
    description_en: "",
    price: "",
    category_id: "",
    images: [] as string[],
    newImageUrl: "",
    is_available: true,
  });
  const [tableForm, setTableForm] = useState({
    table_number: "",
    name: "",
    capacity: "4",
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    name_en: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Upload failed");
          continue;
        }

        const { url } = await res.json();
        setMenuForm((prev) => ({
          ...prev,
          images: [...prev.images, url],
        }));
      }
      toast.success("Tải hình lên thành công / Upload successful");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Không thể tải hình lên / Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      // Refresh business-day reset hour + restaurant info from DB
      initBusinessDaySettings(supabase);
      initRestaurantSettings(supabase).then(({ name, logoUrl }) => {
        setRestaurantNameInput(name);
        setLogoUrlState(logoUrl);
      });

      const [catRes, menuRes, tableRes, orderRes] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("*").order("sort_order"),
        supabase.from("tables").select("*").order("table_number"),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (catRes.error || menuRes.error || tableRes.error) {
        setIsDemo(true);
        setCategories(DEMO_CATEGORIES);
        setMenuItems(DEMO_MENU_ITEMS);
        setTables(DEMO_TABLES);
        setOrders(DEMO_ORDERS);
        return;
      }

      setCategories(catRes.data || []);
      setMenuItems(menuRes.data || []);
      setTables(tableRes.data || []);
      setOrders(orderRes.data || []);
    } catch {
      setIsDemo(true);
      setCategories(DEMO_CATEGORIES);
      setMenuItems(DEMO_MENU_ITEMS);
      setTables(DEMO_TABLES);
      setOrders(DEMO_ORDERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Period range for chart API call — uses business-day boundaries (RESET_HOUR)
  // so a late-night shift past midnight is grouped with the evening before.
  const getChartRange = useCallback(
    (period: typeof chartPeriod): { from: Date; to: Date } => {
      const today = getBusinessDayRange();
      const from = new Date(today.from);
      const to = new Date(today.to);
      if (period === "day") {
        // current business day only — already set
      } else if (period === "week") {
        from.setDate(from.getDate() - 6);
      } else if (period === "month") {
        from.setDate(from.getDate() - 29);
      } else {
        // year: last 12 months including current
        from.setMonth(from.getMonth() - 11);
        from.setDate(1);
      }
      return { from, to };
    },
    [],
  );

  const loadChartOrders = useCallback(async () => {
    try {
      setIsChartLoading(true);
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        const { from, to } = getChartRange(chartPeriod);
        setChartOrders(
          DEMO_ORDERS.filter((o) => {
            const t = new Date(o.created_at).getTime();
            return (
              t >= from.getTime() && t <= to.getTime() && o.status === "done"
            );
          }),
        );
        return;
      }
      const supabase = createClient();
      const { from, to } = getChartRange(chartPeriod);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "done")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString())
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error loading chart orders:", error);
        return;
      }
      setChartOrders(data || []);
    } finally {
      setIsChartLoading(false);
    }
  }, [chartPeriod, getChartRange]);

  useEffect(() => {
    loadChartOrders();
  }, [loadChartOrders]);

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(
    (o) => new Date(o.created_at) >= today && o.status === "done",
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalRevenue = orders
    .filter((o) => o.status === "done")
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Calculate chart data based on selected period (data from API)
  const doneOrdersForChart = chartOrders;

  const chartData = (() => {
    const now = new Date();
    if (chartPeriod === "day") {
      // 24 hourly buckets across the current business day (RESET_HOUR onwards)
      const today = getBusinessDayRange();
      return Array.from({ length: 24 }, (_, i) => {
        const from = new Date(today.from);
        from.setHours(from.getHours() + i);
        const to = new Date(from);
        to.setHours(to.getHours() + 1);
        const bucketOrders = doneOrdersForChart.filter((o) => {
          const d = new Date(o.created_at);
          return d >= from && d < to;
        });
        return {
          date: `${from.getHours().toString().padStart(2, "0")}h`,
          revenue: bucketOrders.reduce((s, o) => s + o.total_amount, 0),
          orders: bucketOrders.length,
        };
      });
    }
    if (chartPeriod === "week") {
      return Array.from({ length: 7 }, (_, i) => {
        const { from, to } = getBusinessDayRangeAgo(6 - i);
        const bucketOrders = doneOrdersForChart.filter((o) => {
          const d = new Date(o.created_at);
          return d >= from && d < to;
        });
        return {
          date: from.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "2-digit",
          }),
          revenue: bucketOrders.reduce((s, o) => s + o.total_amount, 0),
          orders: bucketOrders.length,
        };
      });
    }
    if (chartPeriod === "month") {
      return Array.from({ length: 30 }, (_, i) => {
        const { from, to } = getBusinessDayRangeAgo(29 - i);
        const bucketOrders = doneOrdersForChart.filter((o) => {
          const d = new Date(o.created_at);
          return d >= from && d < to;
        });
        return {
          date: `${from.getDate()}/${from.getMonth() + 1}`,
          revenue: bucketOrders.reduce((s, o) => s + o.total_amount, 0),
          orders: bucketOrders.length,
        };
      });
    }
    // year: 12 calendar months — month boundary mismatch with business day is
    // tiny (~5 hours / month), acceptable for monthly aggregation.
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const bucketOrders = doneOrdersForChart.filter((o) => {
        const d = new Date(o.created_at);
        return d >= date && d < next;
      });
      return {
        date: `T${date.getMonth() + 1}`,
        revenue: bucketOrders.reduce((s, o) => s + o.total_amount, 0),
        orders: bucketOrders.length,
      };
    });
  })();

  const periodRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const periodOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const periodLabel: Record<typeof chartPeriod, string> = {
    day: "Hôm Nay",
    week: "7 Ngày Qua",
    month: "30 Ngày Qua",
    year: "12 Tháng Qua",
  };

  // Category distribution data
  const categoryData = categories
    .map((cat) => {
      const itemCount = menuItems.filter(
        (item) => item.category_id === cat.id,
      ).length;
      return {
        name: cat.name,
        value: itemCount,
      };
    })
    .filter((c) => c.value > 0);

  const CHART_COLORS = [
    "#e85d04",
    "#f48c06",
    "#faa307",
    "#ffba08",
    "#d00000",
    "#9d0208",
  ];

  // Filtered menu items for search
  const filteredMenuItems = useMemo(() => {
    if (!menuSearchQuery.trim()) return menuItems;
    const q = menuSearchQuery.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.name_en?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }, [menuItems, menuSearchQuery]);

  // Menu Item CRUD
  function openMenuDialog(item?: MenuItem) {
    if (item) {
      setEditingItem(item);
      // Get images from images array, or fall back to image_url
      const images =
        item.images && item.images.length > 0
          ? item.images
          : item.image_url
            ? [item.image_url]
            : [];
      setMenuForm({
        name: item.name,
        name_en: item.name_en || "",
        description: item.description || "",
        description_en: item.description_en || "",
        price: item.price.toString(),
        category_id: item.category_id || "",
        images: images,
        newImageUrl: "",
        is_available: item.is_available,
      });
    } else {
      setEditingItem(null);
      setMenuForm({
        name: "",
        name_en: "",
        description: "",
        description_en: "",
        price: "",
        category_id: categories[0]?.id || "",
        images: [],
        newImageUrl: "",
        is_available: true,
      });
    }
    setMenuDialogOpen(true);
  }

  async function saveMenuItem() {
    if (!menuForm.name || !menuForm.price || !menuForm.category_id) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      if (isDemo) {
        if (editingItem) {
          setMenuItems((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? {
                    ...item,
                    name: menuForm.name,
                    name_en: menuForm.name_en || null,
                    description: menuForm.description || null,
                    description_en: menuForm.description_en || null,
                    price: parseInt(menuForm.price),
                    category_id: menuForm.category_id,
                    image_url: menuForm.images[0] || null,
                    images: menuForm.images,
                    is_available: menuForm.is_available,
                  }
                : item,
            ),
          );
        } else {
          const newItem: MenuItem = {
            id: Date.now().toString(),
            name: menuForm.name,
            name_en: menuForm.name_en || null,
            description: menuForm.description || null,
            description_en: menuForm.description_en || null,
            price: parseInt(menuForm.price),
            category_id: menuForm.category_id,
            image_url: menuForm.images[0] || null,
            images: menuForm.images,
            is_available: menuForm.is_available,
            sort_order: menuItems.length + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setMenuItems((prev) => [...prev, newItem]);
        }
        toast.success(editingItem ? "Đã cập nhật món" : "Đã thêm món mới");
        setMenuDialogOpen(false);
        return;
      }

      const supabase = createClient();
      const data = {
        name: menuForm.name,
        name_en: menuForm.name_en || null,
        description: menuForm.description || null,
        description_en: menuForm.description_en || null,
        price: parseInt(menuForm.price),
        category_id: menuForm.category_id,
        image_url: menuForm.images[0] || null,
        images: menuForm.images,
        is_available: menuForm.is_available,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(data)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").insert(data);
        if (error) throw error;
      }

      toast.success(editingItem ? "Đã cập nhật món" : "Đã thêm món mới");
      setMenuDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("Không thể lưu món");
    }
  }

  async function deleteMenuItem(id: string) {
    if (!confirm("Bạn có chắc muốn xóa món này?")) return;

    try {
      if (isDemo) {
        setMenuItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Đã xóa món");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;

      toast.success("Đã xóa món");
      loadData();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Không thể xóa món");
    }
  }

  // Table CRUD
  function openTableDialog(table?: TableType) {
    if (table) {
      setEditingTable(table);
      setTableForm({
        table_number: table.table_number.toString(),
        name: table.name || "",
        capacity: table.capacity.toString(),
      });
    } else {
      setEditingTable(null);
      const nextNumber =
        tables.length > 0
          ? Math.max(...tables.map((t) => t.table_number)) + 1
          : 1;
      setTableForm({
        table_number: nextNumber.toString(),
        name: `Bàn ${nextNumber}`,
        capacity: "4",
      });
    }
    setTableDialogOpen(true);
  }

  async function saveTable() {
    if (!tableForm.table_number) {
      toast.error("Vui lòng điền số bàn");
      return;
    }

    try {
      if (isDemo) {
        if (editingTable) {
          setTables((prev) =>
            prev.map((table) =>
              table.id === editingTable.id
                ? {
                    ...table,
                    table_number: parseInt(tableForm.table_number),
                    name: tableForm.name || null,
                    capacity: parseInt(tableForm.capacity),
                  }
                : table,
            ),
          );
        } else {
          const newTable: TableType = {
            id: Date.now().toString(),
            table_number: parseInt(tableForm.table_number),
            name: tableForm.name || null,
            capacity: parseInt(tableForm.capacity),
            is_active: true,
            qr_code_token: `token-${Date.now()}`,
            created_at: new Date().toISOString(),
          };
          setTables((prev) => [...prev, newTable]);
        }
        toast.success(editingTable ? "Đã cập nhật bàn" : "Đã thêm bàn mới");
        setTableDialogOpen(false);
        return;
      }

      const supabase = createClient();
      const data = {
        table_number: parseInt(tableForm.table_number),
        name: tableForm.name || null,
        capacity: parseInt(tableForm.capacity),
      };

      if (editingTable) {
        const { error } = await supabase
          .from("tables")
          .update(data)
          .eq("id", editingTable.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tables").insert(data);
        if (error) throw error;
      }

      toast.success(editingTable ? "Đã cập nhật bàn" : "Đã thêm bàn mới");
      setTableDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving table:", error);
      toast.error("Không thể lưu bàn");
    }
  }

  async function deleteTable(id: string) {
    if (!confirm("Bạn có chắc muốn xóa bàn này?")) return;

    try {
      if (isDemo) {
        setTables((prev) => prev.filter((table) => table.id !== id));
        toast.success("Đã xóa bàn");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("tables").delete().eq("id", id);
      if (error) throw error;

      toast.success("Đã xóa bàn");
      loadData();
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Không thể xóa bàn");
    }
  }

  // Category CRUD
  function openCategoryDialog(category?: Category) {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        name_en: category.name_en || "",
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", name_en: "" });
    }
    setCategoryDialogOpen(true);
  }

  async function saveCategory() {
    if (!categoryForm.name) {
      toast.error("Vui lòng điền tên danh mục");
      return;
    }

    try {
      if (isDemo) {
        if (editingCategory) {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === editingCategory.id
                ? {
                    ...cat,
                    name: categoryForm.name,
                    name_en: categoryForm.name_en || null,
                  }
                : cat,
            ),
          );
        } else {
          const newCategory: Category = {
            id: Date.now().toString(),
            name: categoryForm.name,
            name_en: categoryForm.name_en || null,
            sort_order: categories.length + 1,
            is_active: true,
            created_at: new Date().toISOString(),
          };
          setCategories((prev) => [...prev, newCategory]);
        }
        toast.success(
          editingCategory ? "Đã cập nhật danh mục" : "Đã thêm danh mục mới",
        );
        setCategoryDialogOpen(false);
        return;
      }

      const supabase = createClient();
      const data = {
        name: categoryForm.name,
        name_en: categoryForm.name_en || null,
        sort_order: editingCategory?.sort_order || categories.length + 1,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(data)
          .eq("id", editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(data);
        if (error) throw error;
      }

      toast.success(
        editingCategory ? "Đã cập nhật danh mục" : "Đã thêm danh mục mới",
      );
      setCategoryDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Không thể lưu danh mục");
    }
  }

  async function toggleCategoryActive(cat: Category) {
    const next = !cat.is_active;
    if (isDemo) {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: next } : c)),
      );
      toast.success(
        next ? `Đã hiện danh mục "${cat.name}"` : `Đã ẩn danh mục "${cat.name}"`,
      );
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("categories")
        .update({ is_active: next })
        .eq("id", cat.id);
      if (error) throw error;
      toast.success(
        next ? `Đã hiện danh mục "${cat.name}"` : `Đã ẩn danh mục "${cat.name}"`,
      );
      loadData();
    } catch (error) {
      console.error("Error toggling category:", error);
      toast.error("Không thể thay đổi trạng thái danh mục");
    }
  }

  async function deleteCategory(cat: Category) {
    if (isDemo) {
      setMenuItems((prev) => prev.filter((mi) => mi.category_id !== cat.id));
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success(`Đã xóa danh mục "${cat.name}" và các món bên trong`);
      return;
    }
    try {
      const supabase = createClient();
      // Delete menu items first (FK constraint)
      const { error: itemsError } = await supabase
        .from("menu_items")
        .delete()
        .eq("category_id", cat.id);
      if (itemsError) throw itemsError;
      const { error: catError } = await supabase
        .from("categories")
        .delete()
        .eq("id", cat.id);
      if (catError) throw catError;
      toast.success(`Đã xóa danh mục "${cat.name}" và các món bên trong`);
      loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Không thể xóa danh mục");
    }
  }

  function getQRCodeUrl(table: TableType) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/order?table=${table.id}&token=${table.qr_code_token}`;
  }

  async function downloadQRCode(table: TableType) {
    const url = getQRCodeUrl(table);
    // Generate QR code using a service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `qr-${table.name || `ban-${table.table_number}`}.png`;
    link.target = "_blank";
    link.click();

    toast.success("Đang tải mã QR");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={restaurantNameInput || "Logo"}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <Settings className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground truncate">
                {restaurantNameInput || "Quản Lý Nhà Hàng"}{" "}
                <span className="text-muted-foreground font-normal">
                  · Admin
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {isDemo && (
                  <Badge variant="secondary" className="mr-2 text-xs">
                    Demo
                  </Badge>
                )}
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/">
              <Button variant="outline" size="icon">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-4 md:mb-6">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm gap-1 sm:gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Tổng Quan</span>
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="text-xs sm:text-sm gap-1 sm:gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
            <TabsTrigger
              value="tables"
              className="text-xs sm:text-sm gap-1 sm:gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Bàn</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs sm:text-sm gap-1 sm:gap-2"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch Sử</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-muted-foreground">
                Khoảng thời gian:
              </span>
              {isChartLoading && (
                <span className="text-xs text-muted-foreground">
                  Đang tải...
                </span>
              )}
              <Select
                value={chartPeriod}
                onValueChange={(v) => setChartPeriod(v as typeof chartPeriod)}
                disabled={isChartLoading}
              >
                <SelectTrigger className="w-36 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày (theo giờ)</SelectItem>
                  <SelectItem value="week">7 ngày</SelectItem>
                  <SelectItem value="month">30 ngày</SelectItem>
                  <SelectItem value="year">12 tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Doanh Thu Hôm Nay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold">
                      {formatPrice(todayRevenue)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayOrders.length} đơn hàng
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Doanh Thu {periodLabel[chartPeriod]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {formatPrice(periodRevenue)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {periodOrders} đơn • Tổng: {formatPrice(totalRevenue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Số Món Trong Menu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-accent-foreground" />
                    <span className="text-2xl font-bold">
                      {menuItems.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {categories.length} danh mục
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Số Bàn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold">{tables.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tables.filter((t) => t.is_active).length} đang hoạt động
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart - Last 7 Days */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Doanh Thu {periodLabel[chartPeriod]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          `${(value / 1000).toFixed(0)}k`
                        }
                        className="text-muted-foreground"
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatPrice(value),
                          "Doanh thu",
                        ]}
                        labelStyle={{ color: "var(--foreground)" }}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Orders Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Số Đơn Hàng {periodLabel[chartPeriod]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: number) => [value, "Đơn hàng"]}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          dot={{ fill: "var(--primary)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Phân Bổ Món Theo Danh Mục
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {categoryData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            value,
                            `${name} món`,
                          ]}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Đơn Hàng Gần Đây</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {orders.slice(0, 10).map((order) => {
                      const table = tables.find((t) => t.id === order.table_id);
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <div className="font-medium">
                              {table?.name ||
                                `Bàn ${table?.table_number || "?"}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(order.created_at)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">
                              {formatPrice(order.total_amount)}
                            </div>
                            <Badge
                              variant={
                                order.status === "done"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {order.status === "done"
                                ? "Hoàn thành"
                                : order.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Settings: Restaurant info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin quán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">Tên quán</Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantNameInput}
                    onChange={(e) => setRestaurantNameInput(e.target.value)}
                    placeholder="VD: Phở Hà Nội"
                    maxLength={80}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => logoUrl && setLightboxImage(logoUrl)}
                      className="w-20 h-20 rounded-lg border bg-muted overflow-hidden shrink-0 flex items-center justify-center cursor-zoom-in"
                      title={logoUrl ? "Xem logo" : "Chưa có logo"}
                      disabled={!logoUrl}
                    >
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </button>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploadingLogo
                          ? "Đang tải..."
                          : logoUrl
                            ? "Đổi logo"
                            : "Tải logo lên"}
                      </Button>
                      {logoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setLogoUrlState(null)}
                          className="text-destructive ml-2"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Bỏ logo
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        JPEG, PNG, WebP, GIF — Tối đa 5MB
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={saveRestaurantInfo}
                  disabled={savingRestaurantInfo}
                >
                  {savingRestaurantInfo ? "Đang lưu..." : "Lưu"}
                </Button>
              </CardContent>
            </Card>

            {/* Settings: Business day reset hour */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cài đặt ca làm việc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Giờ kết thúc ca (0-23). Mặc định 5h sáng — đơn tạo trong
                  khoảng từ giờ này hôm nay đến giờ này hôm sau được tính cùng 1
                  ca. Phù hợp cho quán mở khuya.
                </div>
                <div className="flex items-end gap-2 max-w-sm">
                  <div className="flex-1">
                    <Label htmlFor="reset-hour">Giờ reset ca</Label>
                    <Input
                      className="mt-2"
                      id="reset-hour"
                      type="number"
                      min={0}
                      max={23}
                      value={resetHourInput}
                      onChange={(e) => setResetHourInput(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <Button onClick={saveResetHour} disabled={savingSettings}>
                    {savingSettings ? "Đang lưu..." : "Lưu"}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Hiện tại: <strong>{getResetHour()}h</strong> sáng. Sau khi
                  lưu, trang sẽ tự reload để áp dụng.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Quản Lý Menu</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCategoryDialog()}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="sm:inline">Danh Mục</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => openMenuDialog()}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="sm:inline">Thêm Món</span>
                </Button>
              </div>
            </div>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Danh Mục</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const itemCount = menuItems.filter(
                      (mi) => mi.category_id === cat.id,
                    ).length;
                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center gap-1 rounded-md border bg-secondary/50 hover:bg-secondary/80 transition-colors ${
                          !cat.is_active ? "opacity-60" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="flex items-center gap-1.5 py-1.5 pl-3 text-sm font-medium"
                          onClick={() => openCategoryDialog(cat)}
                          title="Sửa danh mục"
                        >
                          {!cat.is_active && (
                            <EyeOff className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span>{cat.name}</span>
                          <Pencil className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="p-1.5 hover:bg-secondary rounded-r-md"
                              aria-label="Tùy chọn"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  {cat.is_active ? (
                                    <>
                                      <EyeOff className="w-4 h-4 mr-2" />
                                      Ẩn danh mục
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Hiện danh mục
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {cat.is_active
                                      ? `Ẩn danh mục "${cat.name}"?`
                                      : `Hiện danh mục "${cat.name}"?`}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {cat.is_active
                                      ? `${itemCount} món thuộc danh mục này sẽ KHÔNG hiển thị trong menu khách hàng. Dữ liệu vẫn được giữ lại, có thể hiện lại bất cứ lúc nào.`
                                      : `${itemCount} món thuộc danh mục này sẽ hiển thị lại trong menu khách hàng (nếu món đó đang bật trạng thái bán).`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => toggleCategoryActive(cat)}
                                  >
                                    {cat.is_active ? "Ẩn" : "Hiện"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa danh mục
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-destructive" />
                                    Xóa danh mục &ldquo;{cat.name}&rdquo;?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này KHÔNG THỂ HOÀN TÁC.{" "}
                                    <strong>
                                      {itemCount} món thuộc danh mục này sẽ bị
                                      xóa vĩnh viễn
                                    </strong>{" "}
                                    khỏi menu. Cân nhắc dùng &ldquo;Ẩn danh
                                    mục&rdquo; nếu chỉ muốn tạm tắt.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => deleteCategory(cat)}
                                  >
                                    Xóa vĩnh viễn
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm món ăn... / Search dishes..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Menu Items - Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredMenuItems.map((item) => {
                const category = categories.find(
                  (c) => c.id === item.category_id,
                );
                const images =
                  item.images && item.images.length > 0
                    ? item.images
                    : item.image_url
                      ? [item.image_url]
                      : [];
                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openMenuDialog(item)}
                  >
                    <div className="flex">
                      <div className="relative w-24 h-24 shrink-0 bg-muted">
                        {images.length > 0 ? (
                          <>
                            <img
                              src={images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                            {images.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                                +{images.length - 1}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        {!item.is_available && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              Ngưng bán
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-sm leading-tight">
                                {item.name}
                              </h3>
                              {item.name_en && (
                                <p className="text-xs text-muted-foreground">
                                  {item.name_en}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuItem
                                  onClick={() => openMenuDialog(item)}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteMenuItem(item.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {category?.name || "-"}
                          </Badge>
                          <span className="font-semibold text-primary">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Menu Items - Desktop Table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Hình</TableHead>
                        <TableHead>Tên món</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead className="text-right">Giá</TableHead>
                        <TableHead className="text-center">
                          Trạng thái
                        </TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMenuItems.map((item) => {
                        const category = categories.find(
                          (c) => c.id === item.category_id,
                        );
                        return (
                          <TableRow
                            key={item.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openMenuDialog(item)}
                          >
                            <TableCell>
                              {(() => {
                                const images =
                                  item.images && item.images.length > 0
                                    ? item.images
                                    : item.image_url
                                      ? [item.image_url]
                                      : [];
                                return (
                                  <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden">
                                    {images.length > 0 ? (
                                      <>
                                        <img
                                          src={images[0]}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                          crossOrigin="anonymous"
                                        />
                                        {images.length > 1 && (
                                          <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 rounded-tl">
                                            +{images.length - 1}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {item.name_en && (
                                  <div className="text-xs text-muted-foreground">
                                    {item.name_en}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {category?.name || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(item.price)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  item.is_available ? "default" : "destructive"
                                }
                                className={
                                  item.is_available ? "bg-green-600" : ""
                                }
                              >
                                {item.is_available ? "Đang bán" : "Ngưng bán"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div
                                className="flex gap-1 justify-end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openMenuDialog(item)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteMenuItem(item.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* No results */}
            {filteredMenuItems.length === 0 && menuSearchQuery.trim() && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Không tìm thấy món &quot;{menuSearchQuery}&quot;</p>
              </div>
            )}
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Quản Lý Bàn</h2>
              <Button size="sm" onClick={() => openTableDialog()}>
                <Plus className="w-4 h-4 mr-1" />
                Thêm Bàn
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tables.map((table) => (
                <Card key={table.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center">
                      <span className="text-3xl font-bold">
                        {table.table_number}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-center">
                      {table.name || `Bàn ${table.table_number}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center text-sm text-muted-foreground">
                      Sức chứa: {table.capacity} người
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadQRCode(table)}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openTableDialog(table)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive"
                        onClick={() => deleteTable(table.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <h2 className="text-lg font-semibold">Lịch Sử Đơn Hàng</h2>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Đặt lúc</TableHead>
                        <TableHead>Hoàn thành lúc</TableHead>
                        <TableHead>Bàn</TableHead>
                        <TableHead className="text-right">Tổng tiền</TableHead>
                        <TableHead className="text-center">
                          Trạng thái
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const table = tables.find(
                          (t) => t.id === order.table_id,
                        );
                        const isFinal =
                          order.status === "done" ||
                          order.status === "cancelled";
                        return (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openHistoryDetail(order)}
                          >
                            <TableCell className="text-sm whitespace-nowrap">
                              {formatDateTime(order.created_at)}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {isFinal ? (
                                formatDateTime(order.updated_at)
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {table?.name ||
                                `Bàn ${table?.table_number || "?"}`}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(order.total_amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  order.status === "done"
                                    ? "default"
                                    : order.status === "cancelled"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {order.status === "done"
                                  ? "Hoàn thành"
                                  : order.status === "cancelled"
                                    ? "Đã hủy"
                                    : order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Menu Item Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85dvh] flex! flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
            <DialogTitle>
              {editingItem ? "Sửa Món" : "Thêm Món Mới"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6 max-h-175 overflow-scroll">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên món (Tiếng Việt)</Label>
                <Input
                  id="name"
                  value={menuForm.name}
                  onChange={(e) =>
                    setMenuForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: Phở Bò Tái"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_en">Tên món (Tiếng Anh)</Label>
                <Input
                  id="name_en"
                  value={menuForm.name_en}
                  onChange={(e) =>
                    setMenuForm((prev) => ({
                      ...prev,
                      name_en: e.target.value,
                    }))
                  }
                  placeholder="VD: Pho with Rare Beef"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả món ăn (Tiếng Việt)</Label>
                <Input
                  id="description"
                  value={menuForm.description}
                  onChange={(e) =>
                    setMenuForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="VD: Phở bò truyền thống với thịt bò tái mềm..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_en">Mô tả món ăn (Tiếng Anh)</Label>
                <Input
                  id="description_en"
                  value={menuForm.description_en}
                  onChange={(e) =>
                    setMenuForm((prev) => ({
                      ...prev,
                      description_en: e.target.value,
                    }))
                  }
                  placeholder="E.g.: Traditional pho with tender rare beef..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  value={menuForm.price}
                  onChange={(e) =>
                    setMenuForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="VD: 55000"
                />
              </div>
              <div className="space-y-3">
                <Label>Hình ảnh ({menuForm.images.length} hình)</Label>

                {/* Current images */}
                {menuForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {menuForm.images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-lg bg-muted overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Hình ${idx + 1}`}
                          className="w-full h-full object-cover cursor-zoom-in"
                          crossOrigin="anonymous"
                          onClick={() => setLightboxImage(url)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const parent = (e.target as HTMLImageElement)
                              .parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".img-error-placeholder")
                            ) {
                              const placeholder = document.createElement("div");
                              placeholder.className =
                                "img-error-placeholder w-full h-full flex flex-col items-center justify-center text-destructive";
                              placeholder.innerHTML =
                                '<span style="font-size:10px">Lỗi hình</span>';
                              parent.prepend(placeholder);
                            }
                            toast.error(
                              `Hình ${idx + 1} không tải được / Image ${idx + 1} failed to load`,
                            );
                          }}
                        />
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                            Chính
                          </div>
                        )}
                        <button
                          type="button"
                          aria-label="Xóa hình"
                          className="absolute top-1 right-1 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add image by URL */}
                <Label className="text-xs text-muted-foreground">
                  Thêm hình ảnh bằng URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={menuForm.newImageUrl}
                    onChange={(e) =>
                      setMenuForm((prev) => ({
                        ...prev,
                        newImageUrl: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        if (menuForm.newImageUrl.trim()) {
                          setMenuForm((prev) => ({
                            ...prev,
                            images: [...prev.images, prev.newImageUrl.trim()],
                            newImageUrl: "",
                          }));
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (menuForm.newImageUrl.trim()) {
                        setMenuForm((prev) => ({
                          ...prev,
                          images: [...prev.images, prev.newImageUrl.trim()],
                          newImageUrl: "",
                        }));
                      }
                    }}
                    disabled={!menuForm.newImageUrl.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {/* URL Preview */}
                {menuForm.newImageUrl.trim() && (
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Xem trước / Preview:
                    </p>
                    <div className="relative w-20 h-20 rounded-md bg-muted overflow-hidden">
                      <img
                        src={menuForm.newImageUrl.trim()}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const parent = (e.target as HTMLImageElement)
                            .parentElement;
                          if (
                            parent &&
                            !parent.querySelector(".preview-error")
                          ) {
                            const errDiv = document.createElement("div");
                            errDiv.className =
                              "preview-error w-full h-full flex items-center justify-center";
                            errDiv.innerHTML =
                              '<span style="font-size:10px;color:var(--destructive)">Lỗi URL</span>';
                            parent.appendChild(errDiv);
                          }
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.display =
                            "block";
                          const parent = (e.target as HTMLImageElement)
                            .parentElement;
                          const errDiv =
                            parent?.querySelector(".preview-error");
                          if (errDiv) errDiv.remove();
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload image from device */}
                <Label className="text-xs text-muted-foreground">
                  Hoặc tải hình từ thiết bị / Or upload from device
                </Label>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading
                      ? "Đang tải lên..."
                      : "Chọn hình ảnh / Choose images"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WebP, GIF - Tối đa 5MB / Max 5MB each
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={menuForm.category_id}
                  onValueChange={(value) =>
                    setMenuForm((prev) => ({ ...prev, category_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="space-y-0.5">
                  <Label htmlFor="is_available" className="text-sm font-medium">
                    Trạng thái bán
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {menuForm.is_available
                      ? "Món đang được bán và hiển thị trong menu khách hàng"
                      : "Món tạm ngưng bán và không hiển thị trong menu"}
                  </p>
                </div>
                <Switch
                  id="is_available"
                  checked={menuForm.is_available}
                  onCheckedChange={(checked) =>
                    setMenuForm((prev) => ({ ...prev, is_available: checked }))
                  }
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-row gap-2 sm:gap-2 shrink-0 border-t px-4 sm:px-6 py-3 bg-background">
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial"
              onClick={() => setMenuDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button className="flex-1 sm:flex-initial" onClick={saveMenuItem}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Detail Dialog */}
      <Dialog
        open={selectedHistoryOrder !== null}
        onOpenChange={(open) => !open && setSelectedHistoryOrder(null)}
      >
        <DialogContent className="w-[95vw] max-w-lg max-h-[85dvh] flex! flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
            <DialogTitle>Chi Tiết Đơn Hàng</DialogTitle>
          </DialogHeader>
          {selectedHistoryOrder && (
            <ScrollArea className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Bàn</div>
                    <div className="font-medium">
                      {(() => {
                        const t = tables.find(
                          (x) => x.id === selectedHistoryOrder.table_id,
                        );
                        return (
                          t?.name || `Bàn ${t?.table_number || "?"}`
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Trạng thái
                    </div>
                    <Badge
                      variant={
                        selectedHistoryOrder.status === "done"
                          ? "default"
                          : selectedHistoryOrder.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {selectedHistoryOrder.status === "done"
                        ? "Hoàn thành"
                        : selectedHistoryOrder.status === "cancelled"
                          ? "Đã hủy"
                          : selectedHistoryOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Đặt lúc
                    </div>
                    <div className="font-medium text-sm">
                      {formatDateTime(selectedHistoryOrder.created_at)}
                    </div>
                  </div>
                  {(selectedHistoryOrder.status === "done" ||
                    selectedHistoryOrder.status === "cancelled") && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {selectedHistoryOrder.status === "cancelled"
                          ? "Hủy lúc"
                          : "Hoàn thành lúc"}
                      </div>
                      <div className="font-medium text-sm">
                        {formatDateTime(selectedHistoryOrder.updated_at)}
                      </div>
                    </div>
                  )}
                </div>

                {selectedHistoryOrder.notes && (
                  <div
                    className={`text-sm rounded-md p-2 ${
                      selectedHistoryOrder.status === "cancelled"
                        ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
                        : "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300"
                    }`}
                  >
                    {selectedHistoryOrder.status === "cancelled" ? "❌" : "📝"}{" "}
                    {selectedHistoryOrder.notes}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Các món
                  </div>
                  {isLoadingHistoryDetail ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      Đang tải...
                    </div>
                  ) : selectedHistoryOrder.order_items.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      Không có món nào
                    </div>
                  ) : (
                    <div className="border rounded-md divide-y">
                      {selectedHistoryOrder.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 flex items-start gap-3"
                        >
                          <div className="w-12 h-12 rounded-md bg-muted overflow-hidden shrink-0">
                            {item.menu_item?.image_url ||
                            (item.menu_item?.images &&
                              item.menu_item.images[0]) ? (
                              <img
                                src={
                                  item.menu_item?.images?.[0] ||
                                  item.menu_item?.image_url ||
                                  ""
                                }
                                alt=""
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
                            <div className="flex justify-between gap-2 text-sm">
                              <span className="font-medium">
                                {item.menu_item?.name || "Món đã xóa"}
                              </span>
                              <span className="font-medium shrink-0">
                                {formatPrice(item.unit_price * item.quantity)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.quantity} ×{" "}
                              {formatPrice(item.unit_price)}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-orange-600 dark:text-orange-400 italic mt-1 break-words">
                                📝 {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(selectedHistoryOrder.total_amount)}
                  </span>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="shrink-0 border-t px-4 sm:px-6 py-3 bg-background">
            <Button onClick={() => setSelectedHistoryOrder(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog
        open={lightboxImage !== null}
        onOpenChange={(open) => !open && setLightboxImage(null)}
      >
        <DialogContent className="max-w-3xl w-[95vw] p-2 sm:p-4 bg-black/95 border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Xem hình ảnh</DialogTitle>
          </DialogHeader>
          {lightboxImage && (
            <img
              src={lightboxImage}
              alt="Preview"
              className="w-full max-h-[85vh] object-contain"
              crossOrigin="anonymous"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Sửa Bàn" : "Thêm Bàn Mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="table_number">Số bàn</Label>
              <Input
                id="table_number"
                type="number"
                value={tableForm.table_number}
                onChange={(e) =>
                  setTableForm((prev) => ({
                    ...prev,
                    table_number: e.target.value,
                  }))
                }
                placeholder="VD: 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table_name">Tên bàn</Label>
              <Input
                id="table_name"
                value={tableForm.name}
                onChange={(e) =>
                  setTableForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="VD: Bàn VIP 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Sức chứa</Label>
              <Input
                id="capacity"
                type="number"
                value={tableForm.capacity}
                onChange={(e) =>
                  setTableForm((prev) => ({
                    ...prev,
                    capacity: e.target.value,
                  }))
                }
                placeholder="VD: 4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={saveTable}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat_name">Tên danh mục (Tiếng Việt)</Label>
              <Input
                id="cat_name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="VD: PHỞ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat_name_en">Tên danh mục (Tiếng Anh)</Label>
              <Input
                id="cat_name_en"
                value={categoryForm.name_en}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    name_en: e.target.value,
                  }))
                }
                placeholder="VD: Pho"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={saveCategory}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
