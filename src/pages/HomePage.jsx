import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const QR_LOGO = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" aria-label="Gọi Món Logo" role="img">
    <rect x="10" y="10" width="80" height="80" fill="black" />
    <rect x="15" y="15" width="70" height="70" fill="white" />
    <rect x="20" y="20" width="15" height="15" fill="black" />
    <rect x="65" y="20" width="15" height="15" fill="black" />
    <rect x="20" y="65" width="15" height="15" fill="black" />
    <rect x="25" y="25" width="5" height="5" fill="white" />
    <rect x="70" y="25" width="5" height="5" fill="white" />
    <rect x="25" y="70" width="5" height="5" fill="white" />
    <rect x="40" y="40" width="20" height="20" fill="black" />
    <rect x="45" y="45" width="10" height="10" fill="white" />
    <rect x="50" y="50" width="5" height="5" fill="black" />
  </svg>
)

const FEATURES = [
  { icon: '⚡', title: 'Setup Siêu Nhanh', desc: '5 phút là đủ! Không cần code, không cần thiết kế. Chỉ cần upload menu và bắt đầu nhận đơn hàng ngay!', highlight: 'Tiết kiệm 95% thời gian' },
  { icon: '📱', title: 'QR Code Thông Minh', desc: 'Khách quét mã → Xem menu → Đặt món → Thanh toán. Không cần app, không cần tải về!', highlight: 'Tăng 300% đơn hàng' },
  { icon: '💰', title: 'Tăng Doanh Thu Ngay', desc: 'Bán 24/7 không cần nhân viên. Giảm 70% chi phí vận hành, tăng lợi nhuận tối đa!', highlight: 'ROI 500% trong 3 tháng' },
  { icon: '📊', title: 'Quản Lý Đơn Hàng', desc: 'Theo dõi đơn hàng realtime, thống kê doanh thu, quản lý menu và khuyến mãi dễ dàng', highlight: 'Dashboard thông minh' },
  { icon: '🎨', title: 'Thiết Kế Đẹp Mắt', desc: 'Giao diện website hiện đại, responsive trên mọi thiết bị, tùy chỉnh màu sắc và logo', highlight: 'Ấn tượng đầu tiên' },
  { icon: '🔄', title: 'Cập Nhật Realtime', desc: 'Thay đổi menu, giá cả, trạng thái món ăn ngay lập tức. Khách luôn thấy thông tin mới nhất', highlight: 'Đồng bộ tức thì' },
]

const FOOD_EMOJIS = ['🍜', '🍣', '🍔', '🍕', '🍱', '🥘']

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.12)' : undefined }}>
        <div className="navbar-inner">
          <a href="#top" className="nav-logo">
            <QR_LOGO />
            <span>Gọi Món</span>
          </a>

          <ul className="nav-links">
            <li><a href="#about">Về chúng tôi</a></li>
            <li><a href="#goals">Mục tiêu</a></li>
            <li><a href="#features">Tính năng</a></li>
            <li><a href="#contact">Liên hệ</a></li>
          </ul>

          <div className="nav-actions">
            {user ? (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin')}>
                🏠 Dashboard
              </button>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>
                👤 Đăng nhập
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="top" className="hero">
        <div className="container">
          <div className="hero-grid">
            <div style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
              <h1 className="hero-title font-serif">
                Tạo Website
                <span className="text-[#D4AF37]"> Gọi Món Online </span>
                <span style={{ fontSize: 'clamp(20px,3vw,32px)', display: 'block', fontWeight: 700, color: '#0F172A' }}>
                  Chỉ Trong 5 Phút!
                </span>
              </h1>
              <p className="hero-desc">
                <strong>Tăng doanh thu 300%</strong> với website gọi món QR Code<br />
                <strong>0đ chi phí setup</strong> – Không ràng buộc, không phí ẩn<br />
                Khách hàng quét mã → Đặt món → Bạn nhận tiền
              </p>
              <div className="hero-cta">
                <button id="cta-register-hero" className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                  🚀 TẠO WEBSITE MIỄN PHÍ
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/menu/demo')}>
                  👀 XEM DEMO NGAY
                </button>
              </div>
              <div className="hero-trust">
                <span><span className="check">✓</span> Không cần thẻ tín dụng</span>
                <span><span className="check">✓</span> Setup trong 5 phút</span>
                <span><span className="check">✓</span> Hỗ trợ 24/7</span>
              </div>
            </div>

            {/* Visual side */}
            <div className="hero-visual" style={{ height: 400 }}>
              {FOOD_EMOJIS.map((emoji, i) => (
                <div key={i} className="food-icon" style={{ animationDelay: `${i * 0.4}s` }}>
                  {emoji}
                </div>
              ))}
              {/* Center QR illustration */}
              <div style={{
                width: 200,
                height: 200,
                background: 'white',
                borderRadius: 24,
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                border: '2px solid #D4AF37',
                animation: 'pulse-scale 3s ease-in-out forwards',
              }}>
                <QR_LOGO />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Quét để đặt món</span>
                <span style={{ fontSize: 22 }}>📲</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {[
              { num: '5,000+', label: 'Nhà hàng tin dùng' },
              { num: '300%', label: 'Tăng doanh thu trung bình' },
              { num: '5 phút', label: 'Thời gian tạo website' },
              { num: '24/7', label: 'Hỗ trợ khách hàng' },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-number">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="section section-bordered">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Về Chúng Tôi</h2>
            <p className="section-subtitle" style={{ marginTop: 16 }}>
              Đội ngũ chuyên gia công nghệ với 10+ năm kinh nghiệm, cam kết mang đến giải pháp gọi món online tốt nhất cho nhà hàng Việt Nam
            </p>
          </div>
          <div className="about-grid">
            {[
              { icon: '⭐', title: '10+ Năm Kinh Nghiệm', desc: 'Đội ngũ phát triển với hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ F&B' },
              { icon: '🏪', title: '5,000+ Nhà Hàng', desc: 'Được tin tưởng bởi hơn 5,000 nhà hàng trên toàn quốc từ quán nhỏ đến chuỗi lớn' },
              { icon: '🏆', title: 'Cam Kết Chất Lượng', desc: 'Hỗ trợ 24/7, cập nhật liên tục và cam kết hoàn tiền nếu không hài lòng' },
            ].map((a, i) => (
              <div key={i} className="about-card">
                <div className="about-icon">{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goals */}
      <section id="goals" className="section section-bordered">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Mục Tiêu Của Chúng Tôi</h2>
            <p className="section-subtitle" style={{ marginTop: 16 }}>
              Số hóa toàn bộ ngành F&B Việt Nam, giúp mọi nhà hàng đều có thể kinh doanh online hiệu quả
            </p>
          </div>
          <div className="goals-grid">
            <div>
              {[
                { num: 1, title: 'Dân Chủ Hóa Công Nghệ', desc: 'Mang công nghệ gọi món online đến với mọi nhà hàng, từ quán vỉa hè đến nhà hàng cao cấp' },
                { num: 2, title: 'Tăng Doanh Thu Bền Vững', desc: 'Giúp 100,000 nhà hàng tăng doanh thu trung bình 300% trong 3 năm tới' },
                { num: 3, title: 'Xây Dựng Hệ Sinh Thái', desc: 'Kết nối nhà hàng – khách hàng – đối tác giao hàng trong một nền tảng thống nhất' },
              ].map(g => (
                <div key={g.num} className="goal-item">
                  <div className="goal-num">{g.num}</div>
                  <div>
                    <h3>{g.title}</h3>
                    <p>{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="vision-box">
              <h3>Tầm Nhìn 2030</h3>
              <div className="vision-stat">
                <span className="num">100,000+</span>
                <span className="label">Nhà hàng sử dụng</span>
              </div>
              <div className="vision-stat">
                <span className="num">50 Tỷ+</span>
                <span className="label">Doanh thu tạo ra hàng năm</span>
              </div>
              <div className="vision-stat">
                <span className="num">#1</span>
                <span className="label">Nền tảng gọi món Đông Nam Á</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section section-bordered">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tại Sao 5,000+ Nhà Hàng Chọn Chúng Tôi?</h2>
            <p className="section-subtitle" style={{ marginTop: 16 }}>Giải pháp #1 tại Việt Nam – Tăng doanh thu ngay từ ngày đầu!</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-box">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="feature-highlight">→ {f.highlight}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-bordered">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Cách Thức Hoạt Động</h2>
            <p className="section-subtitle" style={{ marginTop: 16 }}>Bắt đầu kinh doanh online chỉ với 3 bước đơn giản</p>
          </div>
          <div className="steps-grid">
            {[
              { num: '1', title: 'Tạo Website', desc: 'Đăng ký tài khoản và tạo website gọi món cho quán của bạn trong 5 phút', icon: '🌐' },
              { num: '2', title: 'Thêm Menu', desc: 'Upload hình ảnh món ăn, thêm mô tả và giá cả để tạo menu trực tuyến hấp dẫn', icon: '🍽️' },
              { num: '3', title: 'Nhận Đơn Hàng', desc: 'Khách hàng quét QR code để đặt món, bạn nhận thông báo và xử lý đơn hàng', icon: '📦' },
            ].map(s => (
              <div key={s.num} className="step-card">
                <div className="step-circle">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2 className="section-title font-serif" style={{ fontSize: 'clamp(28px,5vw,52px)' }}>Đừng Để Đối Thủ Vượt Mặt!</h2>
          <p style={{ fontSize: 20, color: '#D4AF37', fontWeight: 700, marginTop: 12 }}>
            Hơn 1,000 nhà hàng đã tăng doanh thu 300% với chúng tôi
          </p>
          <p style={{ fontSize: 16, color: '#0F172A', marginTop: 8 }}>
            Chỉ còn <strong style={{ color: '#D4AF37' }}>48 giờ</strong> để nhận ưu đãi đặc biệt!
          </p>

          <div className="cta-box">
            <div className="cta-free-grid">
              {[
                { num: '✓ MIỄN PHÍ', label: 'Setup & Thiết kế' },
                { num: '✓ MIỄN PHÍ', label: '7 ngày dùng thử' },
                { num: '✓ MIỄN PHÍ', label: 'Hỗ trợ 24/7' },
              ].map((c, i) => (
                <div key={i}>
                  <div className="cta-free-num">{c.num}</div>
                  <div className="cta-free-label">{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button id="cta-register-bottom" className="btn btn-primary btn-lg hover:animate-pulse-scale transition-all" onClick={() => navigate('/register')}>
              🚀 TẠO WEBSITE NGAY – MIỄN PHÍ
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => window.open('https://zalo.me/0347857647', '_blank')}>
              📞 GỌI TƯ VẤN: 0347.857.647
            </button>
          </div>
          <p style={{ marginTop: 24, color: '#374151', fontSize: 15 }}>
            <strong>Cam kết:</strong> Tăng doanh thu 200% trong 30 ngày hoặc hoàn tiền 100%
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <QR_LOGO />
                Gọi Món
              </div>
              <p className="footer-desc">
                Giải pháp gọi món QR Code thông minh hàng đầu Việt Nam. Giúp nhà hàng tăng doanh thu và nâng cao trải nghiệm khách hàng.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {['📘', '📷', '▶️'].map((icon, i) => (
                  <button key={i} style={{ fontSize: 22, cursor: 'pointer', background: 'transparent', border: 'none' }} aria-label={`Social media link ${i + 1}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4>Sản phẩm</h4>
              <ul>
                <li><a href="#features">Tính năng</a></li>
                <li><a href="/menu/demo">Demo menu</a></li>
                <li><a href="/register">Bắt đầu miễn phí</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Hỗ trợ</h4>
              <ul>
                <li><button className="text-gray-500 hover:text-[#D4AF37] text-[14px] bg-transparent border-none p-0 cursor-pointer transition-colors" onClick={() => {}}>Hướng dẫn sử dụng</button></li>
                <li><button className="text-gray-500 hover:text-[#D4AF37] text-[14px] bg-transparent border-none p-0 cursor-pointer transition-colors" onClick={() => {}}>FAQ</button></li>
                <li><button className="text-gray-500 hover:text-[#D4AF37] text-[14px] bg-transparent border-none p-0 cursor-pointer transition-colors" onClick={() => {}}>Liên hệ hỗ trợ</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Liên hệ</h4>
              <ul>
                <li><a href="tel:0347857647">📞 0347.857.647</a></li>
                <li><a href="mailto:support@goimon.shop">✉️ support@goimon.shop</a></li>
                <li><span className="text-gray-500 text-[14px]">📍 TP. Hồ Chí Minh</span></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 Gọi Món. Bảo lưu mọi quyền. Thiết kế bởi đội ngũ Gọi Món.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
