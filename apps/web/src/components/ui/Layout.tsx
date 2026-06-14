import { NavLink } from 'react-router-dom';
import { HomeIcon, SearchIcon, BellIcon, PersonIcon } from './Icons';
import styles from './Layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      {/* 데스크탑 사이드바 */}
      <nav className={styles.sidebar}>
        <div className={styles.logo}>logged.</div>
        <div className={styles.navLinks}>
          <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <HomeIcon size={20} />
            <span>피드</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <SearchIcon size={20} />
            <span>검색</span>
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <BellIcon size={20} />
            <span>알림</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <PersonIcon size={20} />
            <span>프로필</span>
          </NavLink>
        </div>
      </nav>

      <main className={styles.main}>
        {children}
      </main>

      {/* 모바일 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.bottomItem} ${styles.active}` : styles.bottomItem}>
          <HomeIcon size={22} />
          <span>피드</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? `${styles.bottomItem} ${styles.active}` : styles.bottomItem}>
          <SearchIcon size={22} />
          <span>검색</span>
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => isActive ? `${styles.bottomItem} ${styles.active}` : styles.bottomItem}>
          <BellIcon size={22} />
          <span>알림</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.bottomItem} ${styles.active}` : styles.bottomItem}>
          <PersonIcon size={22} />
          <span>프로필</span>
        </NavLink>
      </nav>
    </div>
  );
}
