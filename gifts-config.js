/**
 * ============================================================================
 * CẤU HÌNH KHU VƯỜN HOA HỒNG 20/10 (DỄ DÀNG CHỈNH SỬA TRONG CODE HOẶC TRÊN WEB)
 * ============================================================================
 */

window.ROSE_CONFIG = {
  // Mã kênh nhận kết quả tự động (Giúp bạn biết ngay người ấy đã chọn món gì!)
  // Khi người ấy bấm "Chốt 3 Món", web sẽ tự động gửi ngầm kết quả về kênh này.
  // Bạn có thể xem trực tiếp trong mục "📬 Xem Kết Quả" ngay trên web!
  orderChannelId: "rose2010-vibecode-86032005",

  // (Tùy chọn) Nếu bạn muốn nhận thêm qua Webhook riêng (Discord / Make / Zapier)
  customWebhookUrl: "",

  // Số lượng món tối đa được phép chọn (Mặc định: 3 món)
  maxSelections: 3,

  // Thông tin lời chúc tinh tế, tự nhiên (Không nhắc đến Phúc Long trong lời chúc)
  recipientName: "Mọi người",
  senderName: "Lời chúc 20/10 🌹",
  occasionBadge: "KHU VƯỜN HOA HỒNG • 20/10",
  heroTitle: "Khu Vườn Hoa Hồng & Quà Tặng 20/10",
  letterGreeting: "Chúc mọi người ngày 20/10 thật rạng rỡ & ngập tràn niềm vui!",
  letterBody:
    "Nhân ngày Phụ nữ Việt Nam 20/10, chúc mọi người luôn xinh đẹp, tươi trẻ như những đóa hoa hồng ban mai, công việc thuận lợi và luôn tràn đầy năng lượng tích cực. Nhân ngày đặc biệt này, mời mọi người tự tay chọn món yêu thích nhất (từ 1 đến tối đa 3 món) ở bên dưới nhé!",
  letterSignature: "Chúc một ngày 20/10 thật ngọt ngào & nhiều niềm vui 🌹",

  // Danh mục lọc trên giao diện
  categories: [
    { id: "all", label: "Tất cả ✨" },
    { id: "fruit-tea", label: "Trà Trái Cây 🍑" },
    { id: "milk-tea", label: "Trà Sữa 🧋" },
    { id: "blended", label: "Đá Xay & Sữa Chua 🍧" },
    { id: "bakery", label: "Bánh Ngọt & Khác 🥐" }
  ],

  // Danh sách các món đồ uống & bánh ngọt (Có thể cấu hình tùy ý)
  gifts: [
    {
      id: "pl-tra-dao",
      title: "Trà Đào Cam Sả",
      subtitle: "Thanh mát & Thơm lừng",
      description: "Trà đào thơm dịu kết hợp cam vàng tươi, sả thanh mát và miếng đào ngâm giòn ngọt.",
      icon: "🍑",
      badge: "Best Seller",
      category: "fruit-tea"
    },
    {
      id: "pl-hong-tra-sua",
      title: "Hồng Trà Sữa Đậm Vị",
      subtitle: "Thơm béo truyền thống",
      description: "Hồng trà ủ đậm đà thơm nồng hòa quyện cùng sữa tươi béo ngậy vừa miệng.",
      icon: "🧋",
      badge: "Signature",
      category: "milk-tea"
    },
    {
      id: "pl-olong-sua",
      title: "Trà Ô Long Sữa (Kem Phô Mai)",
      subtitle: "Hương Ô Long nướng",
      description: "Trà Ô Long thanh tao quyện sữa thơm dịu, có thể thêm lớp kem phô mai mặn béo.",
      icon: "🫖",
      badge: "Must Try",
      category: "milk-tea"
    },
    {
      id: "pl-tra-vai-lai",
      title: "Trà Vải Hoa Lài",
      subtitle: "Ngọt dịu & Giải nhiệt",
      description: "Nền trà hoa lài thơm ngát kết hợp cùng trái vải ngâm mọng nước giòn ngọt.",
      icon: "🪷",
      badge: "Hot Pick",
      category: "fruit-tea"
    },
    {
      id: "pl-lucky-tea",
      title: "Trà Thảo Mộc Trái Cây (Lucky Tea)",
      subtitle: "Đầy ắp trái cây tươi",
      description: "Sự kết hợp của trà, cam, chanh, vải, nhãn và thảo mộc thanh mát ngày 20/10.",
      icon: "🍊",
      badge: "Healthy",
      category: "fruit-tea"
    },
    {
      id: "pl-hong-tra-dac-cam",
      title: "Hồng Trà Đác Cam / Đác Thơm",
      subtitle: "Topping hạt đác rim dẻo giòn",
      description: "Hồng trà đậm vị dùng kèm hạt đác rim cam/thơm giòn sần sật cực kỳ cuốn miệng.",
      icon: "🍹",
      badge: "Yêu thích",
      category: "fruit-tea"
    },
    {
      id: "pl-tra-hoa-hong",
      title: "Trà Hoa Hồng (Rose Tea)",
      subtitle: "Hương hoa hồng dịu nhẹ",
      description: "Hương hoa hồng thơm ngát quyện cùng nền trà thanh khiết, dịu nhẹ và thư giãn.",
      icon: "🌹",
      badge: "20/10 Special",
      category: "fruit-tea"
    },
    {
      id: "pl-tra-sua-matcha",
      title: "Trà Sữa Matcha",
      subtitle: "Thơm trà xanh dịu nhẹ",
      description: "Bột trà xanh Matcha Nhật Bản hòa quyện cùng sữa tươi béo ngậy, ngọt dịu.",
      icon: "🍵",
      badge: "Matcha Lover",
      category: "milk-tea"
    },
    {
      id: "pl-matcha-da-xay",
      title: "Matcha Đá Xay Kem Tươi",
      subtitle: "Mát lạnh sảng khoái",
      description: "Trà xanh đá xay mịn mượt phủ lớp kem tươi Whipping Cream bồng bềnh phía trên.",
      icon: "🍧",
      badge: "Ice Blended",
      category: "blended"
    },
    {
      id: "pl-sua-chua-phuc-bon-tu",
      title: "Sữa Chua Phúc Bồn Tử Đác Cam",
      subtitle: "Chua ngọt tự nhiên",
      description: "Sữa chua lên men tự nhiên kết hợp mứt phúc bồn tử chua ngọt và hạt đác giòn ngon.",
      icon: "🍓",
      badge: "Fresh",
      category: "blended"
    },
    {
      id: "pl-banh-ngot",
      title: "Bánh Tiramisu / Bánh Phô Mai Chảy",
      subtitle: "Dùng kèm trà cực hợp",
      description: "Bánh ngọt Tiramisu mềm mịn hoặc bánh mì chà bông phô mai thơm phức.",
      icon: "🥐",
      badge: "Bakery",
      category: "bakery"
    },
    {
      id: "pl-custom-drink",
      title: "Món Khác Tự Chọn (Tự Nhập Tên)",
      subtitle: "Ghi món bất kỳ bạn thích",
      description: "Chạm vào đây để tự nhập tên món đồ uống, size hoặc món quà bất kỳ bạn muốn!",
      icon: "✨",
      badge: "Tự chọn",
      category: "bakery",
      isCustomInput: true
    }
  ],

  // Kho mẫu cấu hình nhanh (Presets)
  presets: {
    phuclong: {
      name: "🧋 Menu Đồ Uống & Bánh Ngọt (Mặc định)"
    },
    gifts2010: {
      name: "🎁 Menu Quà Tặng & Đặc Quyền 20/10",
      heroTitle: "Khu Vườn Hoa Hồng & Quà Tặng 20/10",
      letterGreeting: "Chúc mọi người ngày 20/10 thật rạng rỡ & ngập tràn niềm vui!",
      letterBody:
        "Nhân ngày Phụ nữ Việt Nam 20/10, chúc mọi người luôn tươi trẻ, rạng ngời như đóa hồng ban mai và gặp thật nhiều may mắn. Hãy chọn 3 món quà / đồ uống yêu thích nhất bên dưới nhé!",
      categories: [
        { id: "all", label: "Tất cả ✨" },
        { id: "fruit-tea", label: "Đồ uống & Ăn vặt 🧋" },
        { id: "milk-tea", label: "Quà xinh 🌹" },
        { id: "blended", label: "Trải nghiệm 🎉" },
        { id: "bakery", label: "Tự chọn ✨" }
      ],
      gifts: [
        {
          id: "g-rose",
          title: "Hoa Hồng Tươi & Thiệp 20/10",
          subtitle: "Rạng rỡ sắc hồng",
          description: "Đóa hoa hồng tươi thắm kèm lời chúc tốt đẹp nhất nhân ngày Phụ nữ Việt Nam.",
          icon: "🌹",
          badge: "20/10",
          category: "milk-tea"
        },
        {
          id: "g-drink",
          title: "Ly Trà Trái Cây / Trà Sữa Full Topping",
          subtitle: "Đồ uống tự chọn",
          description: "Một ly đồ uống bất kỳ theo sở thích (Trà đào cam sả, Ô long sữa, Hồng trà...).",
          icon: "🧋",
          badge: "Hot Pick",
          category: "fruit-tea"
        },
        {
          id: "g-cake",
          title: "Bánh Ngọt Tiramisu / Mousse",
          subtitle: "Ngọt ngào ngày lễ",
          description: "Một phần bánh kem mềm mịn ngọt ngào thưởng thức buổi trà chiều 20/10.",
          icon: "🍰",
          badge: "Sweet",
          category: "fruit-tea"
        },
        {
          id: "g-snack",
          title: "Combo Ăn Vặt Ngọt Ngào",
          subtitle: "Trái cây & Đồ ăn vặt",
          description: "Set trái cây tươi, bánh ngọt và đồ ăn vặt nhâm nhi buổi chiều.",
          icon: "🍓",
          badge: "Yummy",
          category: "fruit-tea"
        },
        {
          id: "g-lipbalm",
          title: "Son Dưỡng / Kem Dưỡng Da Tay",
          subtitle: "Chăm sóc dịu dàng",
          description: "Món quà nhỏ xinh giúp đôi môi và làn da tay luôn mềm mại, thơm hương hoa hồng.",
          icon: "💄",
          badge: "Beauty",
          category: "milk-tea"
        },
        {
          id: "g-cup",
          title: "Ly Giữ Nhiệt / Cốc Sứ Xinh Xắn",
          subtitle: "Tiện lợi mỗi ngày",
          description: "Chiếc cốc xinh xắn để pha trà, cà phê và nhắc nhớ uống đủ nước mỗi ngày.",
          icon: "☕",
          badge: "Cute",
          category: "milk-tea"
        },
        {
          id: "g-blindbox",
          title: "Hộp Quà Bí Mật (Blindbox / Gấu Nhỏ)",
          subtitle: "Khui quà may mắn",
          description: "Một hộp quà bất ngờ hoặc móc khóa gấu bông dễ thương treo túi xách.",
          icon: "🧸",
          badge: "Surprise",
          category: "milk-tea"
        },
        {
          id: "g-lunch",
          title: "Bữa Ăn Ngon Tự Chọn",
          subtitle: "Ấm áp & Vui vẻ",
          description: "Một buổi đi ăn món ngon yêu thích ngập tràn tiếng cười.",
          icon: "🍽️",
          badge: "Party",
          category: "blended"
        },
        {
          id: "g-custom",
          title: "Món Khác Tự Chọn (Tự Nhập)",
          subtitle: "Theo đúng ý thích",
          description: "Chạm vào đây để tự nhập tên món đồ uống hoặc món quà bạn mong muốn!",
          icon: "✨",
          badge: "Custom",
          category: "bakery",
          isCustomInput: true
        }
      ]
    }
  }
};
