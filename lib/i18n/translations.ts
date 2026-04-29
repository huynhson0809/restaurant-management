export type Language = "vi" | "en";

export const translations = {
  vi: {
    // Common
    cancel: "Hủy",
    save: "Lưu",
    add: "Thêm",
    edit: "Sửa",
    delete: "Xóa",
    search: "Tìm kiếm",
    loading: "Đang tải...",

    // Order Interface
    selectDishesToAdd: "Chọn món để thêm vào giỏ",
    searchDishes: "Tìm món ăn...",
    addToCart: "Thêm vào giỏ hàng",
    quantity: "Số lượng",
    noteOptional: "Ghi chú (tùy chọn)",
    notePlaceholder: "Ví dụ: Ít cay, không hành, thêm rau...",
    subtotal: "Thành tiền",
    cart: "Giỏ Hàng",
    yourCart: "Giỏ hàng của bạn",
    cartEmpty: "Chưa có món nào trong giỏ",
    total: "Tổng cộng",
    placeOrder: "Đặt Món",
    placing: "Đang gửi...",
    addNote: "Thêm ghi chú",
    editNote: "Sửa ghi chú",
    noteFor: "Ghi chú cho",

    // Order Success
    orderSuccess: "Đặt Món Thành Công!",
    orderSentToCashier:
      "Đơn hàng của bạn đã được gửi đến thu ngân. Vui lòng chờ trong giây lát.",
    orderMore: "Đặt Thêm Món",

    // Order History
    orderedItems: "Món Đã Đặt",
    viewOrderedItems: "Xem món đã đặt",
    noOrderedItems: "Chưa đặt món nào",
    orderedAt: "Đặt lúc",
    reorder: "Đặt lại",
    orderHistory: "Lịch sử đặt món",

    // Cart messages
    tapToOrder: "Thêm vào giỏ hàng",
    added: "Đã thêm",
    cartIsEmpty: "Giỏ hàng trống",
    orderSent: "Đơn hàng đã được gửi đi!",
    orderSentDemo: "Đơn hàng đã được gửi đi! (Demo Mode)",
    orderFailed: "Không thể gửi đơn hàng. Vui lòng thử lại.",

    // Cashier
    cashierDashboard: "Thu Ngân",
    newOrders: "Đơn Mới",
    preparing: "Đang Làm",
    ready: "Sẵn Sàng",
    done: "Hoàn Thành",
    tableView: "Theo Bàn",
    noNewOrders: "Không có đơn hàng mới",
    noPreparingOrders: "Không có đơn đang làm",
    noReadyOrders: "Không có đơn sẵn sàng",
    markPreparing: "Bắt đầu làm",
    markReady: "Sẵn sàng",
    markDone: "Hoàn thành",

    // Admin
    adminDashboard: "Quản Trị",
    overview: "Tổng quan",
    menu: "Thực Đơn",
    categories: "Danh Mục",
    tables: "Bàn",
    history: "Lịch Sử",
    todayRevenue: "Doanh thu hôm nay",
    totalRevenue: "Tổng doanh thu",
    totalOrders: "Tổng đơn hàng",
    totalTables: "Số bàn",
    recentOrders: "Đơn Hàng Gần Đây",
    last7DaysRevenue: "Doanh Thu 7 Ngày Qua",
    last7DaysOrders: "Số Đơn Hàng 7 Ngày",
    categoryDistribution: "Phân Bổ Món Theo Danh Mục",

    // Menu management
    addNewDish: "Thêm Món Mới",
    editDish: "Sửa Món",
    dishName: "Tên món",
    dishNameEn: "Tên món (Tiếng Anh)",
    description: "Mô tả món ăn",
    price: "Giá (VND)",
    images: "Hình ảnh",
    imageUrl: "URL hình ảnh",
    addImage: "Thêm hình",
    category: "Danh mục",
    available: "Còn hàng",
    status: "Trạng thái",
    actions: "Thao tác",

    // Table management
    addNewTable: "Thêm Bàn Mới",
    editTable: "Sửa Bàn",
    tableNumber: "Số bàn",
    tableName: "Tên bàn",
    capacity: "Sức chứa",
    active: "Hoạt động",
    downloadQR: "Tải QR Code",
    clearTable: "Dọn bàn",
    clearTableConfirm:
      "Xác nhận dọn bàn này? Session mới sẽ được tạo cho khách tiếp theo.",
    tableCleared: "Đã dọn bàn, sẵn sàng cho khách mới",
    sessionExpired: "Phiên đặt món đã hết hạn. Vui lòng quét lại mã QR.",

    // Language
    language: "Ngôn ngữ",
    vietnamese: "Tiếng Việt",
    english: "English",
  },
  en: {
    // Common
    cancel: "Cancel",
    save: "Save",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    loading: "Loading...",

    // Order Interface
    selectDishesToAdd: "Select dishes to add to cart",
    searchDishes: "Search dishes...",
    addToCart: "Add to Cart",
    quantity: "Quantity",
    noteOptional: "Note (optional)",
    notePlaceholder: "E.g.: Less spicy, no onions, extra vegetables...",
    subtotal: "Subtotal",
    cart: "Cart",
    yourCart: "Your Cart",
    cartEmpty: "Your cart is empty",
    total: "Total",
    placeOrder: "Place Order",
    placing: "Placing...",
    addNote: "Add note",
    editNote: "Edit note",
    noteFor: "Note for",

    // Order Success
    orderSuccess: "Order Placed Successfully!",
    orderSentToCashier:
      "Your order has been sent to the cashier. Please wait a moment.",
    orderMore: "Order More",

    // Order History
    orderedItems: "Ordered Items",
    viewOrderedItems: "View ordered items",
    noOrderedItems: "No items ordered yet",
    orderedAt: "Ordered at",
    reorder: "Reorder",
    orderHistory: "Order History",

    // Cart messages
    tapToOrder: "Tap to order",
    added: "Added",
    cartIsEmpty: "Cart is empty",
    orderSent: "Order has been sent!",
    orderSentDemo: "Order has been sent! (Demo Mode)",
    orderFailed: "Failed to place order. Please try again.",

    // Cashier
    cashierDashboard: "Cashier",
    newOrders: "New Orders",
    preparing: "Preparing",
    ready: "Ready",
    done: "Done",
    tableView: "By Table",
    noNewOrders: "No new orders",
    noPreparingOrders: "No orders being prepared",
    noReadyOrders: "No orders ready",
    markPreparing: "Start preparing",
    markReady: "Mark ready",
    markDone: "Mark done",

    // Admin
    adminDashboard: "Admin",
    overview: "Overview",
    menu: "Menu",
    categories: "Categories",
    tables: "Tables",
    history: "History",
    todayRevenue: "Today's Revenue",
    totalRevenue: "Total Revenue",
    totalOrders: "Total Orders",
    totalTables: "Total Tables",
    recentOrders: "Recent Orders",
    last7DaysRevenue: "Revenue - Last 7 Days",
    last7DaysOrders: "Orders - Last 7 Days",
    categoryDistribution: "Menu Items by Category",

    // Menu management
    addNewDish: "Add New Dish",
    editDish: "Edit Dish",
    dishName: "Dish name",
    dishNameEn: "Dish name (English)",
    description: "Description",
    price: "Price (VND)",
    images: "Images",
    imageUrl: "Image URL",
    addImage: "Add image",
    category: "Category",
    available: "Available",
    status: "Status",
    actions: "Actions",

    // Table management
    addNewTable: "Add New Table",
    editTable: "Edit Table",
    tableNumber: "Table number",
    tableName: "Table name",
    capacity: "Capacity",
    active: "Active",
    downloadQR: "Download QR Code",
    clearTable: "Clear Table",
    clearTableConfirm:
      "Confirm clearing this table? A new session will be created for the next customer.",
    tableCleared: "Table cleared, ready for new customers",
    sessionExpired: "Session expired. Please scan the QR code again.",

    // Language
    language: "Language",
    vietnamese: "Vietnamese",
    english: "English",
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;
