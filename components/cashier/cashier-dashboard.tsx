"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  Bell,
  RefreshCw,
  LayoutGrid,
  Home,
  Trash2,
  AlertTriangle,
} from "lucide-react";
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
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem, MenuItem, Table } from "@/lib/supabase/types";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  getBusinessDayRange,
  formatBusinessDayLabel,
  getResetHour,
  initBusinessDaySettings,
} from "@/lib/business-day";
import { useRestaurantInfo } from "@/lib/use-restaurant-info";

type OrderStatus = "new" | "preparing" | "ready" | "done" | "cancelled";

type OrderWithDetails = Order & {
  order_items: (OrderItem & { menu_item: MenuItem | null })[];
  table: Table | null;
};

// Demo data with more realistic orders
const DEMO_ORDERS: OrderWithDetails[] = [
  {
    id: "1",
    table_id: "1",
    session_id: "demo-1",
    status: "new",
    total_amount: 165000,
    notes: null,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    table: {
      id: "1",
      table_number: 1,
      name: "Bàn 1",
      capacity: 4,
      is_active: true,
      qr_code_token: "demo",
      session_token: "session1",
      session_started_at: null,
      created_at: "",
    },
    order_items: [
      {
        id: "1",
        order_id: "1",
        menu_item_id: "1",
        quantity: 2,
        unit_price: 55000,
        notes: "Ít cay",
        created_at: "",
        menu_item: {
          id: "1",
          category_id: "1",
          name: "Cơm Tấm Sườn Bì Chả",
          name_en: "Broken Rice with Pork Chop",
          description: "Cơm tấm đặc trưng Sài Gòn",
          description_en: null,
          price: 55000,
          image_url:
            "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=200",
          images: null,
          is_available: true,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
      },
      {
        id: "1b",
        order_id: "1",
        menu_item_id: "21",
        quantity: 1,
        unit_price: 35000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "21",
          category_id: "6",
          name: "Gỏi Cuốn",
          name_en: "Fresh Spring Rolls",
          description: "2 cuốn gỏi cuốn tôm thịt",
          description_en: null,
          price: 35000,
          image_url:
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=200",
          images: null,
          is_available: true,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
      },
      {
        id: "1c",
        order_id: "1",
        menu_item_id: "30",
        quantity: 2,
        unit_price: 10000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "30",
          category_id: "7",
          name: "Nước Ngọt",
          name_en: "Soft Drink",
          description: null,
          description_en: null,
          price: 10000,
          image_url: null,
          images: null,
          is_available: true,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
      },
    ],
  },
  {
    id: "2",
    table_id: "3",
    session_id: "demo-2",
    status: "new",
    total_amount: 175000,
    notes: "Khách VIP",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    table: {
      id: "3",
      table_number: 3,
      name: "Bàn 3",
      capacity: 6,
      is_active: true,
      qr_code_token: "demo",
      session_token: "session3",
      session_started_at: null,
      created_at: "",
    },
    order_items: [
      {
        id: "2",
        order_id: "2",
        menu_item_id: "6",
        quantity: 2,
        unit_price: 55000,
        notes: "Nhiều hành",
        created_at: "",
        menu_item: {
          id: "6",
          category_id: "3",
          name: "Phở Bò Tái",
          name_en: "Pho with Rare Beef",
          description: "Phở nước trong với thịt bò tái mềm",
          description_en: null,
          price: 55000,
          image_url:
            "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200",
          images: null,
          is_available: true,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
      },
      {
        id: "3",
        order_id: "2",
        menu_item_id: "22",
        quantity: 1,
        unit_price: 35000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "22",
          category_id: "6",
          name: "Chả Giò",
          name_en: "Fried Spring Rolls",
          description: "4 cuốn chả giò giòn rụm",
          description_en: null,
          price: 35000,
          image_url:
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=200",
          images: null,
          is_available: true,
          sort_order: 2,
          created_at: "",
          updated_at: "",
        },
      },
      {
        id: "4",
        order_id: "2",
        menu_item_id: "31",
        quantity: 3,
        unit_price: 10000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "31",
          category_id: "7",
          name: "Trà Đá",
          name_en: "Iced Tea",
          description: null,
          description_en: null,
          price: 10000,
          image_url: null,
          images: null,
          is_available: true,
          sort_order: 2,
          created_at: "",
          updated_at: "",
        },
      },
    ],
  },
  {
    id: "3",
    table_id: "5",
    session_id: "demo-3",
    status: "preparing",
    total_amount: 85000,
    notes: null,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    table: {
      id: "5",
      table_number: 5,
      name: "Bàn 5",
      capacity: 2,
      is_active: true,
      qr_code_token: "demo",
      session_token: "session5",
      session_started_at: null,
      created_at: "",
    },
    order_items: [
      {
        id: "5",
        order_id: "3",
        menu_item_id: "14",
        quantity: 2,
        unit_price: 30000,
        notes: "Không rau mùi",
        created_at: "",
        menu_item: {
          id: "14",
          category_id: "4",
          name: "Bánh Mì Thịt Nướng",
          name_en: "Banh Mi with Grilled Pork",
          description: "Bánh mì thịt heo nướng thơm",
          description_en: null,
          price: 30000,
          image_url:
            "https://images.unsplash.com/photo-1600454309261-3dc6c57f6a0e?w=200",
          images: null,
          is_available: true,
          sort_order: 3,
          created_at: "",
          updated_at: "",
        },
      },
      {
        id: "6",
        order_id: "3",
        menu_item_id: "23",
        quantity: 1,
        unit_price: 30000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "23",
          category_id: "6",
          name: "Xíu Mại Chén",
          name_en: "Steamed Meatballs",
          description: "Xíu mại hấp sốt cà chua",
          description_en: null,
          price: 30000,
          image_url:
            "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200",
          images: null,
          is_available: true,
          sort_order: 3,
          created_at: "",
          updated_at: "",
        },
      },
    ],
  },
  {
    id: "4",
    table_id: "2",
    session_id: "demo-4",
    status: "ready",
    total_amount: 120000,
    notes: null,
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    table: {
      id: "2",
      table_number: 2,
      name: "Bàn 2",
      capacity: 4,
      is_active: true,
      qr_code_token: "demo",
      session_token: "session2",
      session_started_at: null,
      created_at: "",
    },
    order_items: [
      {
        id: "7",
        order_id: "4",
        menu_item_id: "4",
        quantity: 2,
        unit_price: 50000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "4",
          category_id: "2",
          name: "Bún Thịt Nướng Chả Giò",
          name_en: "Vermicelli with Grilled Pork",
          description: "Bún tươi với thịt nướng và chả giò giòn",
          description_en: null,
          price: 50000,
          image_url:
            "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200",
          images: null,
          is_available: true,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
      },
      {
        id: "8",
        order_id: "4",
        menu_item_id: "31",
        quantity: 2,
        unit_price: 10000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "31",
          category_id: "7",
          name: "Trà Đá",
          name_en: "Iced Tea",
          description: null,
          description_en: null,
          price: 10000,
          image_url: null,
          images: null,
          is_available: true,
          sort_order: 2,
          created_at: "",
          updated_at: "",
        },
      },
    ],
  },
  {
    id: "5",
    table_id: "4",
    session_id: "demo-5",
    status: "done",
    total_amount: 195000,
    notes: null,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    table: {
      id: "4",
      table_number: 4,
      name: "Bàn 4",
      capacity: 4,
      is_active: true,
      qr_code_token: "demo",
      session_token: "session4",
      session_started_at: null,
      created_at: "",
    },
    order_items: [
      {
        id: "9",
        order_id: "5",
        menu_item_id: "10",
        quantity: 1,
        unit_price: 65000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "10",
          category_id: "3",
          name: "Phở Bò Sốt Vang",
          name_en: "Pho with Beef Stew",
          description: "Phở đặc biệt với bò sốt vang đậm đà",
          description_en: null,
          price: 65000,
          image_url:
            "https://images.unsplash.com/photo-1583224994076-2eb6ce77b7ab?w=200",
          images: null,
          is_available: true,
          sort_order: 5,
          created_at: "",
          updated_at: "",
        },
      },
      {
        id: "10",
        order_id: "5",
        menu_item_id: "11",
        quantity: 2,
        unit_price: 50000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "11",
          category_id: "3",
          name: "Phở Gà",
          name_en: "Chicken Pho",
          description: "Phở gà nước trong vị thanh",
          description_en: null,
          price: 50000,
          image_url:
            "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=200",
          images: null,
          is_available: true,
          sort_order: 6,
          created_at: "",
          updated_at: "",
        },
      },
      {
        id: "11",
        order_id: "5",
        menu_item_id: "31",
        quantity: 3,
        unit_price: 10000,
        notes: null,
        created_at: "",
        menu_item: {
          id: "31",
          category_id: "7",
          name: "Trà Đá",
          name_en: "Iced Tea",
          description: null,
          description_en: null,
          price: 10000,
          image_url: null,
          images: null,
          is_available: true,
          sort_order: 2,
          created_at: "",
          updated_at: "",
        },
      },
    ],
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case "new":
      return { label: "Mới", color: "bg-blue-500", icon: Bell };
    case "preparing":
      return { label: "Đang làm", color: "bg-yellow-500", icon: ChefHat };
    case "ready":
      return { label: "Sẵn sàng", color: "bg-green-500", icon: CheckCircle };
    case "done":
      return { label: "Hoàn thành", color: "bg-gray-500", icon: CheckCircle };
    case "cancelled":
      return { label: "Đã hủy", color: "bg-red-500", icon: XCircle };
    default:
      return { label: status, color: "bg-gray-500", icon: Clock };
  }
}

export function CashierDashboard() {
  const { t } = useLanguage();
  const { name: restaurantName, logoUrl } = useRestaurantInfo();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [isDemo, setIsDemo] = useState(false);
  const [clearingTableId, setClearingTableId] = useState<string | null>(null);
  const [doneOrders, setDoneOrders] = useState<OrderWithDetails[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<OrderWithDetails[]>(
    [],
  );
  const [tableOrdersDialogOpen, setTableOrdersDialogOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [statsDialogStatus, setStatsDialogStatus] =
    useState<OrderStatus | null>(null);
  const [cancelDialogOrderId, setCancelDialogOrderId] = useState<string | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrders = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setIsLoading(true);
      // Business day range — boundaries at RESET_HOUR (default 5 AM) so
      // orders past midnight stay grouped with the previous evening's shift.
      const { from, to } = getBusinessDayRange();

      // Check if Supabase is configured
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        setIsDemo(true);
        // Active orders: no date filter — must always show until served
        setOrders(
          DEMO_ORDERS.filter((o) =>
            ["new", "preparing", "ready"].includes(o.status),
          ),
        );
        setDoneOrders([]);
        setCancelledOrders([]);
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      // Active orders: NO date filter — they must remain visible until cashier
      // moves them to done/cancelled, regardless of when they were created.
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          table:tables(*),
          order_items(*, menu_item:menu_items(*))
        `,
        )
        .in("status", ["new", "preparing", "ready"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        return;
      }

      setOrders((data as OrderWithDetails[]) ?? []);

      const [doneRes, cancelledRes] = await Promise.all([
        supabase
          .from("orders")
          .select(
            `
            *,
            table:tables(*),
            order_items(*, menu_item:menu_items(*))
          `,
          )
          .eq("status", "done")
          .gte("created_at", from.toISOString())
          .lt("created_at", to.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(
            `
            *,
            table:tables(*),
            order_items(*, menu_item:menu_items(*))
          `,
          )
          .eq("status", "cancelled")
          .gte("created_at", from.toISOString())
          .lt("created_at", to.toISOString())
          .order("created_at", { ascending: false }),
      ]);
      setDoneOrders((doneRes.data as OrderWithDetails[]) ?? []);
      setCancelledOrders((cancelledRes.data as OrderWithDetails[]) ?? []);
    } catch (err) {
      console.error("Exception loading orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const DEMO_TABLES: Table[] = [
    {
      id: "1",
      table_number: 1,
      name: "Bàn 1",
      capacity: 4,
      is_active: true,
      qr_code_token: "demo1",
      session_token: "session1",
      session_started_at: new Date().toISOString(),
      created_at: "",
    },
    {
      id: "2",
      table_number: 2,
      name: "Bàn 2",
      capacity: 4,
      is_active: true,
      qr_code_token: "demo2",
      session_token: "session2",
      session_started_at: new Date().toISOString(),
      created_at: "",
    },
    {
      id: "3",
      table_number: 3,
      name: "Bàn 3",
      capacity: 6,
      is_active: true,
      qr_code_token: "demo3",
      session_token: "session3",
      session_started_at: new Date().toISOString(),
      created_at: "",
    },
    {
      id: "4",
      table_number: 4,
      name: "Bàn 4",
      capacity: 4,
      is_active: true,
      qr_code_token: "demo4",
      session_token: "session4",
      session_started_at: new Date().toISOString(),
      created_at: "",
    },
    {
      id: "5",
      table_number: 5,
      name: "Bàn 5",
      capacity: 2,
      is_active: true,
      qr_code_token: "demo5",
      session_token: "session5",
      session_started_at: new Date().toISOString(),
      created_at: "",
    },
    {
      id: "6",
      table_number: 6,
      name: "Bàn 6",
      capacity: 8,
      is_active: true,
      qr_code_token: "demo6",
      session_token: "session6",
      session_started_at: new Date().toISOString(),
      created_at: "",
    },
  ];

  const loadTables = useCallback(async () => {
    try {
      // Check if Supabase is configured
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        setTables(DEMO_TABLES);
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .eq("is_active", true)
        .order("table_number");

      if (error || !data) {
        setTables(DEMO_TABLES);
        return;
      }

      setTables(data);
    } catch {
      setTables(DEMO_TABLES);
    }
  }, []);

  // Notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();

      // Play a two-tone notification sound
      const playTone = (freq: number, startTime: number, duration: number) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = freq;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playTone(880, now, 0.15);
      playTone(1100, now + 0.15, 0.15);
      playTone(880, now + 0.3, 0.2);
    } catch {
      // Audio not available, silently ignore
    }
  }, []);

  // Keep a ref to tables so the realtime callback always sees the latest value
  const tablesRef = useRef<Table[]>([]);
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  // Load data on mount
  useEffect(() => {
    initBusinessDaySettings(createClient());
    loadOrders();
    loadTables();
  }, [loadOrders, loadTables]);

  // Listen for new orders via Supabase Broadcast (true realtime, no polling)
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }

    const supabase = createClient();

    const channel = supabase
      .channel("new-orders")
      .on("broadcast", { event: "new-order" }, (message) => {
        console.log("Broadcast received:", message);
        const { table_name } = message.payload;
        playNotificationSound();
        toast.info(`🔔 ${table_name || "Đơn mới"} - Có đơn hàng mới!`, {
          duration: 8000,
          description: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        loadOrders({ silent: true });
      })
      .subscribe((status) => {
        console.log("Broadcast channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders, playNotificationSound]);

  async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    cancelReasonText?: string,
  ) {
    // Cancel flow needs a reason — open reason dialog first
    if (newStatus === "cancelled" && !cancelReasonText) {
      setCancelDialogOrderId(orderId);
      setCancelReason("");
      return;
    }

    const order =
      orders.find((o) => o.id === orderId) ||
      doneOrders.find((o) => o.id === orderId) ||
      cancelledOrders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedNotes =
      newStatus === "cancelled" && cancelReasonText
        ? `Lý do hủy: ${cancelReasonText}${order.notes ? `\n${order.notes}` : ""}`
        : order.notes;
    const updated = { ...order, status: newStatus, notes: updatedNotes };

    // Optimistic UI update — move between lists without re-fetching
    if (newStatus === "done") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setDoneOrders((prev) => [updated, ...prev]);
    } else if (newStatus === "cancelled") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setCancelledOrders((prev) => [updated, ...prev]);
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
    setDetailDialogOpen(false);

    if (isDemo) {
      toast.success(`Đã cập nhật trạng thái đơn hàng`);
      return;
    }

    try {
      const supabase = createClient();
      const updatePayload: { status: OrderStatus; notes?: string | null } = {
        status: newStatus,
      };
      if (newStatus === "cancelled" && cancelReasonText) {
        updatePayload.notes = updatedNotes;
      }
      const { error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId);

      if (error) throw error;

      // Broadcast status change to customer
      const channel = supabase.channel("order-status");
      await channel.subscribe();
      await channel.send({
        type: "broadcast",
        event: "status-change",
        payload: {
          order_id: orderId,
          session_id: order.session_id,
          table_id: order.table_id,
          new_status: newStatus,
          reason: cancelReasonText || null,
          table_name: order.table?.name || `Bàn ${order.table?.table_number}`,
        },
      });
      supabase.removeChannel(channel);

      toast.success(`Đã cập nhật trạng thái đơn hàng`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Không thể cập nhật đơn hàng");
      // Revert optimistic update on failure
      if (newStatus === "done") {
        setDoneOrders((prev) => prev.filter((o) => o.id !== orderId));
        setOrders((prev) => [order, ...prev]);
      } else if (newStatus === "cancelled") {
        setCancelledOrders((prev) => prev.filter((o) => o.id !== orderId));
        setOrders((prev) => [order, ...prev]);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? order : o)));
      }
    }
  }

  async function confirmCancelOrder() {
    const reason = cancelReason.trim();
    if (!reason || !cancelDialogOrderId) return;
    setIsCancelling(true);
    try {
      await updateOrderStatus(cancelDialogOrderId, "cancelled", reason);
    } finally {
      setIsCancelling(false);
      setCancelDialogOrderId(null);
      setCancelReason("");
    }
  }

  function openOrderDetail(order: OrderWithDetails) {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  }

  async function clearTable(tableId: string) {
    try {
      if (isDemo) {
        // In demo mode, just mark all orders for this table as done
        setOrders((prev) =>
          prev.map((order) =>
            order.table_id === tableId ? { ...order, status: "done" } : order,
          ),
        );
        toast.success(t("tableCleared"));
        setClearingTableId(null);
        return;
      }

      const supabase = createClient();

      // Look up the OLD session token before rotating, so we can purge its
      // shared cart row. The customer-facing app receives the realtime tables
      // UPDATE event and resets local cart/history on its own.
      const { data: oldTableData } = await supabase
        .from("tables")
        .select("session_token")
        .eq("id", tableId)
        .single();
      const oldSessionToken = (oldTableData as { session_token?: string } | null)
        ?.session_token;

      // Mark all orders for this table as done
      const { error: ordersError } = await supabase
        .from("orders")
        .update({ status: "done" })
        .eq("table_id", tableId)
        .in("status", ["new", "preparing", "ready"]);

      if (ordersError) throw ordersError;

      // Delete the shared cart row tied to the old session (cosmetic — would
      // become an orphan otherwise). Errors here are non-fatal.
      if (oldSessionToken) {
        await supabase
          .from("table_carts")
          .delete()
          .eq("session_token", oldSessionToken);
      }

      // Generate new session token for the table — this triggers the
      // postgres_changes UPDATE event that customer tabs subscribe to.
      const { error: tableError } = await supabase
        .from("tables")
        .update({
          session_token: crypto.randomUUID(),
          session_started_at: new Date().toISOString(),
        })
        .eq("id", tableId);

      if (tableError) throw tableError;

      await loadOrders();
      await loadTables();
      toast.success(t("tableCleared"));
      setClearingTableId(null);
    } catch (error) {
      console.error("Error clearing table:", error);
      toast.error("Không thể dọn bàn");
    }
  }

  const newOrders = orders.filter((o) => o.status === "new");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  // Server already filters by date; use as-is
  const newOrdersByDate = newOrders;
  const preparingOrdersByDate = preparingOrders;
  const readyOrdersByDate = readyOrders;
  const doneOrdersByDate = doneOrders;
  const cancelledOrdersByDate = cancelledOrders;

  function getOrdersByStatus(status: OrderStatus): OrderWithDetails[] {
    if (status === "new") return newOrdersByDate;
    if (status === "preparing") return preparingOrdersByDate;
    if (status === "ready") return readyOrdersByDate;
    if (status === "done") return doneOrdersByDate;
    if (status === "cancelled") return cancelledOrdersByDate;
    return [];
  }

  // All orders belonging to the current session of each table.
  // Includes done/cancelled — table is only marked empty after cashier presses "Dọn bàn"
  // (which rotates table.session_started_at). Orders before that timestamp belong to
  // a previous session and are excluded.
  const tableById = tables.reduce(
    (acc, t) => {
      acc[t.id] = t;
      return acc;
    },
    {} as Record<string, Table>,
  );

  const tableOrdersMap = [...orders, ...doneOrders, ...cancelledOrders].reduce(
    (acc, order) => {
      if (!order.table_id) return acc;
      const table = tableById[order.table_id];
      const sessionStart = table?.session_started_at
        ? new Date(table.session_started_at).getTime()
        : 0;
      const orderTime = new Date(order.created_at).getTime();
      if (orderTime < sessionStart) return acc;
      if (!acc[order.table_id]) acc[order.table_id] = [];
      acc[order.table_id].push(order);
      return acc;
    },
    {} as Record<string, OrderWithDetails[]>,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
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
                <ClipboardList className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground truncate">
                {restaurantName}{" "}
                <span className="text-muted-foreground font-normal">
                  · Thu Ngân
                </span>
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                {isDemo && (
                  <Badge variant="secondary" className="text-xs">
                    Demo
                  </Badge>
                )}
                <span>
                  Ca {formatBusinessDayLabel()} ({getResetHour()}h-
                  {getResetHour()}h sáng mai)
                </span>
                <span>•</span>
                <span>{orders.length} đơn đang xử lý</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="outline" size="icon" onClick={() => loadOrders()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link href="/">
              <Button variant="outline" size="icon">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats - Hôm nay */}
        <div className="grid grid-cols-5 gap-2 md:gap-3 mt-4 max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => setStatsDialogStatus("new")}
            className="text-left"
          >
            <Card className="bg-blue-50 dark:bg-blue-950/30 hover:ring-2 hover:ring-blue-400 transition-shadow cursor-pointer">
              <CardContent className="p-2 md:p-4 text-center">
                <div className="text-xl md:text-3xl font-bold text-blue-600">
                  {newOrdersByDate.length}
                </div>
                <div className="text-xs md:text-sm text-blue-600">Mới</div>
              </CardContent>
            </Card>
          </button>
          <button
            type="button"
            onClick={() => setStatsDialogStatus("preparing")}
            className="text-left"
          >
            <Card className="bg-yellow-50 dark:bg-yellow-950/30 hover:ring-2 hover:ring-yellow-400 transition-shadow cursor-pointer">
              <CardContent className="p-2 md:p-4 text-center">
                <div className="text-xl md:text-3xl font-bold text-yellow-600">
                  {preparingOrdersByDate.length}
                </div>
                <div className="text-xs md:text-sm text-yellow-600">
                  Đang làm
                </div>
              </CardContent>
            </Card>
          </button>
          <button
            type="button"
            onClick={() => setStatsDialogStatus("ready")}
            className="text-left"
          >
            <Card className="bg-green-50 dark:bg-green-950/30 hover:ring-2 hover:ring-green-400 transition-shadow cursor-pointer">
              <CardContent className="p-2 md:p-4 text-center">
                <div className="text-xl md:text-3xl font-bold text-green-600">
                  {readyOrdersByDate.length}
                </div>
                <div className="text-xs md:text-sm text-green-600">
                  Sẵn sàng
                </div>
              </CardContent>
            </Card>
          </button>
          <button
            type="button"
            onClick={() => setStatsDialogStatus("done")}
            className="text-left"
          >
            <Card className="bg-gray-50 dark:bg-gray-950/30 hover:ring-2 hover:ring-gray-400 transition-shadow cursor-pointer">
              <CardContent className="p-2 md:p-4 text-center">
                <div className="text-xl md:text-3xl font-bold text-gray-600">
                  {doneOrdersByDate.length}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Hoàn thành
                </div>
              </CardContent>
            </Card>
          </button>
          <button
            type="button"
            onClick={() => setStatsDialogStatus("cancelled")}
            className="text-left"
          >
            <Card className="bg-red-50 dark:bg-red-950/30 hover:ring-2 hover:ring-red-400 transition-shadow cursor-pointer">
              <CardContent className="p-2 md:p-4 text-center">
                <div className="text-xl md:text-3xl font-bold text-red-600">
                  {cancelledOrdersByDate.length}
                </div>
                <div className="text-xs md:text-sm text-red-600">Đã hủy</div>
              </CardContent>
            </Card>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-4 md:mb-6 max-w-md mx-auto md:mx-0">
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Đơn Hàng
            </TabsTrigger>
            <TabsTrigger value="tables" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Sơ Đồ Bàn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Đang tải...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Chưa có đơn hàng nào
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[calc(100vh-280px)]">
                {/* Column: New */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between font-semibold text-blue-600 border-b-2 border-blue-500 pb-2 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Mới
                    </div>
                    <Badge variant="secondary" className="text-blue-600">
                      {newOrders.length}
                    </Badge>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-2">
                      {newOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Không có đơn mới
                        </div>
                      ) : (
                        newOrders.map((order) => (
                          <CompactCard
                            key={order.id}
                            order={order}
                            onView={() => openOrderDetail(order)}
                            onAction={() =>
                              updateOrderStatus(order.id, "preparing")
                            }
                            actionLabel="Làm"
                            actionIcon={<ChefHat className="w-3 h-3" />}
                            actionColor="bg-yellow-500 hover:bg-yellow-600"
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Column: Preparing */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between font-semibold text-yellow-600 border-b-2 border-yellow-500 pb-2 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      Đang Làm
                    </div>
                    <Badge variant="secondary" className="text-yellow-600">
                      {preparingOrders.length}
                    </Badge>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-2">
                      {preparingOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Không có đơn đang làm
                        </div>
                      ) : (
                        preparingOrders.map((order) => (
                          <CompactCard
                            key={order.id}
                            order={order}
                            onView={() => openOrderDetail(order)}
                            onAction={() =>
                              updateOrderStatus(order.id, "ready")
                            }
                            actionLabel="Món đã xong"
                            actionIcon={<CheckCircle className="w-3 h-3" />}
                            actionColor="bg-green-500 hover:bg-green-600"
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Column: Ready */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between font-semibold text-green-600 border-b-2 border-green-500 pb-2 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Sẵn Sàng
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      {readyOrders.length}
                    </Badge>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-2">
                      {readyOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Không có đơn sẵn sàng
                        </div>
                      ) : (
                        readyOrders.map((order) => (
                          <CompactCard
                            key={order.id}
                            order={order}
                            onView={() => openOrderDetail(order)}
                            onAction={() => updateOrderStatus(order.id, "done")}
                            actionLabel="Hoàn thành"
                            actionIcon={<CheckCircle className="w-3 h-3" />}
                            actionColor="bg-primary hover:bg-primary/90"
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tables">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {tables.map((table) => {
                const tableOrders = tableOrdersMap[table.id] || [];
                const hasNewOrders = tableOrders.some(
                  (o) => o.status === "new",
                );
                const hasUnservedOrders = tableOrders.some((o) =>
                  ["new", "preparing", "ready"].includes(o.status),
                );
                const hasActiveOrders = tableOrders.length > 0;
                const allFinished = hasActiveOrders && !hasUnservedOrders;

                return (
                  <Card
                    key={table.id}
                    className={`cursor-pointer transition-all ${
                      hasNewOrders
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : hasUnservedOrders
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30"
                          : allFinished
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                            : "hover:border-muted-foreground/30"
                    }`}
                    onClick={() => {
                      if (tableOrders.length > 0) {
                        setSelectedTableId(table.id);
                        setTableOrdersDialogOpen(true);
                      }
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-1">
                        {table.table_number}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {table.name || `Bàn ${table.table_number}`}
                      </div>
                      {hasActiveOrders ? (
                        <div className="space-y-2">
                          <Badge
                            variant={
                              hasNewOrders
                                ? "default"
                                : allFinished
                                  ? "outline"
                                  : "secondary"
                            }
                            className={
                              allFinished
                                ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                                : ""
                            }
                          >
                            {tableOrders.length} đơn
                            {allFinished && " • Chờ dọn"}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                {t("clearTable")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent
                              onClick={(e) => e.stopPropagation()}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                  {t("clearTable")} -{" "}
                                  {table.name || `Bàn ${table.table_number}`}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("clearTableConfirm")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => clearTable(table.id)}
                                >
                                  {t("clearTable")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        <Badge variant="outline">Trống</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Table Orders Dialog */}
      <Dialog
        open={tableOrdersDialogOpen}
        onOpenChange={setTableOrdersDialogOpen}
      >
        <DialogContent className="w-[95vw] max-w-lg max-h-[85dvh] flex! flex-col">
          {(() => {
            const tbl = tables.find((t) => t.id === selectedTableId);
            const tblOrders = selectedTableId
              ? tableOrdersMap[selectedTableId] || []
              : [];
            return (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {tbl?.name || `Bàn ${tbl?.table_number}`} —{" "}
                    {tblOrders.length} đơn
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 min-h-0 overflow-y-auto px-6">
                  <div className="space-y-4 py-2">
                    {tblOrders.map((order) => {
                      const config = getStatusConfig(order.status);
                      return (
                        <div key={order.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              {formatTime(order.created_at)}
                            </span>
                            <Badge className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                          <div className="space-y-1.5 mb-3">
                            {order.order_items.map((item) => (
                              <div key={item.id}>
                                <div className="flex justify-between text-sm">
                                  <span>
                                    {item.quantity}x{" "}
                                    {item.menu_item?.name || "?"}
                                  </span>
                                  <span className="font-medium">
                                    {formatPrice(
                                      item.unit_price * item.quantity,
                                    )}
                                  </span>
                                </div>
                                {item.notes && (
                                  <div className="text-xs text-orange-600 dark:text-orange-400 italic pl-3">
                                    📝 {item.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {order.notes && (
                            <div
                              className={`text-xs rounded px-2 py-1 mb-2 break-words ${
                                order.status === "cancelled"
                                  ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30"
                                  : "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30"
                              }`}
                            >
                              {order.status === "cancelled" ? "❌" : "📝"}{" "}
                              {order.notes}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-primary">
                              {formatPrice(order.total_amount)}
                            </span>
                            {order.status === "new" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() =>
                                  updateOrderStatus(order.id, "preparing")
                                }
                              >
                                <ChefHat className="w-3 h-3 mr-1" />
                                Làm
                              </Button>
                            )}
                            {order.status === "preparing" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white"
                                onClick={() =>
                                  updateOrderStatus(order.id, "ready")
                                }
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Món đã xong
                              </Button>
                            )}
                            {order.status === "ready" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  updateOrderStatus(order.id, "done")
                                }
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Hoàn thành
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85dvh] flex! flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4">
              <span>
                {selectedOrder?.table?.name ||
                  `Bàn ${selectedOrder?.table?.table_number}`}
              </span>
              {selectedOrder && (
                <Badge className={getStatusConfig(selectedOrder.status).color}>
                  {getStatusConfig(selectedOrder.status).label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <>
              <div className="text-sm text-muted-foreground">
                Đặt lúc: {formatTime(selectedOrder.created_at)}
              </div>

              <ScrollArea className="flex-1 min-h-0 overflow-y-auto px-6">
                <div className="space-y-3 py-4">
                  {selectedOrder.order_items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium">
                            {item.quantity}x {item.menu_item?.name || "Unknown"}
                          </div>
                          {item.notes && (
                            <div className="text-sm text-muted-foreground italic">
                              Ghi chú: {item.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(item.unit_price * item.quantity)}
                        </div>
                      </div>
                      {index < selectedOrder.order_items.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold mb-4">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  {selectedOrder.status === "new" && (
                    <Button
                      className="w-full bg-yellow-500 hover:bg-yellow-600"
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "preparing")
                      }
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      Bắt Đầu Làm
                    </Button>
                  )}
                  {selectedOrder.status === "preparing" && (
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "ready")
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Món Đã Sẵn Sàng
                    </Button>
                  )}
                  {selectedOrder.status === "ready" && (
                    <Button
                      className="w-full"
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "done")
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Hoàn Thành Đơn
                    </Button>
                  )}
                  {selectedOrder.status !== "done" &&
                    selectedOrder.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        className="w-full text-destructive"
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, "cancelled")
                        }
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Hủy Đơn
                      </Button>
                    )}
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Reason Dialog */}
      <Dialog
        open={cancelDialogOrderId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelDialogOrderId(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Hủy đơn hàng</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do hủy. Khách hàng sẽ nhận được thông báo kèm lý
              do này.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex flex-wrap gap-2">
              {["Hết món", "Khách yêu cầu hủy", "Đặt nhầm", "Bếp quá tải"].map(
                (preset) => (
                  <Button
                    key={preset}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCancelReason(preset)}
                  >
                    {preset}
                  </Button>
                ),
              )}
            </div>
            <Textarea
              placeholder="Nhập lý do hủy..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value.slice(0, 200))}
              rows={3}
              maxLength={200}
              className="resize-none"
              autoFocus
            />
            <div className="text-xs text-muted-foreground text-right">
              {cancelReason.length}/200
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setCancelDialogOrderId(null);
                setCancelReason("");
              }}
              disabled={isCancelling}
            >
              Đóng
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmCancelOrder}
              disabled={!cancelReason.trim() || isCancelling}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Drill-down Dialog */}
      <Dialog
        open={statsDialogStatus !== null}
        onOpenChange={(open) => !open && setStatsDialogStatus(null)}
      >
        <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {statsDialogStatus
                ? `${getStatusConfig(statsDialogStatus).label} - ${["new", "preparing", "ready"].includes(statsDialogStatus) ? "Tất cả đơn hiện tại" : `Ca ${formatBusinessDayLabel()}`}`
                : ""}
            </DialogTitle>
            <DialogDescription>
              {statsDialogStatus
                ? `${getOrdersByStatus(statsDialogStatus).length} đơn`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-2 max-h-150 overflow-scroll">
            <div className="space-y-2">
              {statsDialogStatus &&
              getOrdersByStatus(statsDialogStatus).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Không có đơn nào
                </div>
              ) : (
                statsDialogStatus &&
                getOrdersByStatus(statsDialogStatus).map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {order.table?.name ||
                            `Bàn ${order.table?.table_number ?? "?"}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {order.order_items.length} món •{" "}
                        {order.total_amount.toLocaleString("vi-VN")}đ
                      </div>
                      {order.status === "cancelled" && order.notes && (
                        <div className="text-xs text-red-600 mt-1 italic break-words">
                          {order.notes.split("\n")[0]}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openOrderDetail(order)}
                    >
                      Chi tiết
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompactCard({
  order,
  onView,
  onAction,
  actionLabel,
  actionIcon,
  actionColor,
}: {
  order: OrderWithDetails;
  onView: () => void;
  onAction: () => void;
  actionLabel: string;
  actionIcon: React.ReactNode;
  actionColor: string;
}) {
  const hasNotes = order.notes || order.order_items.some((i) => i.notes);
  const itemCount = order.order_items.reduce((sum, i) => sum + i.quantity, 0);
  const elapsed = Math.round(
    (Date.now() - new Date(order.created_at).getTime()) / 60000,
  );
  const isStale = elapsed >= 90;
  function formatElapsed(mins: number): string {
    if (mins < 1) return "vừa xong";
    if (mins < 60) return `${mins}p`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}h` : `${h}h${m}p`;
  }

  return (
    <Card
      className={`transition-shadow hover:shadow-md cursor-pointer group ${
        isStale ? "ring-2 ring-red-400 dark:ring-red-600" : ""
      }`}
      onClick={onView}
    >
      <CardContent className="p-2.5">
        {/* Row 1: Table + time + action */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm shrink-0">
            {order.table?.name || `B${order.table?.table_number}`}
          </span>
          <span
            className={`text-xs ${
              isStale ? "text-red-600 font-semibold" : "text-muted-foreground"
            }`}
            title={isStale ? "Đơn quá lâu chưa xử lý" : undefined}
          >
            {isStale && "⚠️ "}
            {formatElapsed(elapsed)}
          </span>
          {hasNotes && (
            <span className="text-orange-500 text-xs" title="Có ghi chú">
              📝
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {itemCount} món
          </span>
          <Button
            size="sm"
            className={`h-6 px-2 text-xs text-white shrink-0 ${actionColor}`}
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
          >
            {actionIcon}
            <span className="ml-1 hidden sm:inline">{actionLabel}</span>
          </Button>
        </div>
        {/* Items list with notes */}
        <div className="mt-1.5 space-y-0.5">
          {order.order_items.map((item) => (
            <div key={item.id} className="text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span className="truncate mr-2">
                  {item.quantity}x {item.menu_item?.name || "?"}
                </span>
                <span className="shrink-0">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </div>
              {item.notes && (
                <div
                  className="text-orange-600 dark:text-orange-400 italic pl-3 truncate"
                  title={item.notes}
                >
                  📝 {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
        {order.notes && (
          <div
            className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded px-1.5 py-0.5 mt-1 truncate"
            title={order.notes}
          >
            📝 {order.notes}
          </div>
        )}
        <div className="flex items-center justify-end mt-1">
          <span className="text-xs font-semibold text-primary">
            {formatPrice(order.total_amount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
