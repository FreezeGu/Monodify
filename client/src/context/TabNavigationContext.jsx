import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TAB_PREFIXES = {
  featured: ['/', '/album/', '/artist/', '/playlist/', '/search', '/browse'],
  playlists: ['/playlists'],
  profile: ['/profile', '/upload'],
};

const OVERLAY_PATHS = ['/queue', '/lyrics'];

function getTabFromPath(pathname) {
  if (OVERLAY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'))) return null;
  if (pathname.startsWith('/playlists')) return 'playlists';
  if (pathname.startsWith('/profile') || pathname.startsWith('/upload')) return 'profile';
  return 'featured';
}

const initialStacks = {
  featured: ['/'],
  playlists: ['/playlists'],
  profile: ['/profile'],
};

const TabNavigationContext = createContext(null);

export function TabNavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const stacksRef = useRef(JSON.parse(JSON.stringify(initialStacks)));
  const lastNavigationWasBack = useRef(false);
  const lastTabRef = useRef('featured');
  const directionRef = useRef('forward');

  const pathname = location.pathname;
  const search = location.search;
  const fullPath = pathname + search;

  const currentTab = getTabFromPath(pathname) ?? lastTabRef.current;
  if (getTabFromPath(pathname) != null) lastTabRef.current = currentTab;

  useEffect(() => {
    const tab = getTabFromPath(pathname) ?? lastTabRef.current;
    const stack = stacksRef.current[tab];
    if (!stack) return;
    if (lastNavigationWasBack.current) {
      lastNavigationWasBack.current = false;
      return;
    }
    const top = stack[stack.length - 1];
    const topPath = top?.split('?')[0];
    const currentPath = pathname;
    if (topPath !== currentPath) {
      stacksRef.current[tab] = [...stack, fullPath];
    }
  }, [pathname, search, fullPath]);

  const push = useCallback(
    (to) => {
      directionRef.current = 'forward';
      navigate(to);
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    const tab = getTabFromPath(pathname) ?? lastTabRef.current;
    const stack = stacksRef.current[tab];
    if (!stack || stack.length <= 1) return;
    const nextStack = stack.slice(0, -1);
    const target = nextStack[nextStack.length - 1];
    stacksRef.current[tab] = nextStack;
    lastNavigationWasBack.current = true;
    directionRef.current = 'back';
    navigate(target);
  }, [navigate, pathname]);

  const switchTab = useCallback(
    (tab) => {
      const stack = stacksRef.current[tab];
      const target = stack && stack.length > 0 ? stack[stack.length - 1] : initialStacks[tab][0];
      directionRef.current = 'forward';
      navigate(target);
    },
    [navigate]
  );

  const canGoBack = useCallback(() => {
    const tab = getTabFromPath(pathname) ?? lastTabRef.current;
    const stack = stacksRef.current[tab];
    return stack && stack.length > 1;
  }, [pathname]);

  const getDirection = useCallback(() => directionRef.current, []);

  const value = {
    currentTab,
    push,
    goBack,
    switchTab,
    canGoBack,
    getDirection,
    stacksRef,
  };

  return (
    <TabNavigationContext.Provider value={value}>
      {children}
    </TabNavigationContext.Provider>
  );
}

export function useTabNavigation() {
  const ctx = useContext(TabNavigationContext);
  if (!ctx) throw new Error('useTabNavigation must be used within TabNavigationProvider');
  return ctx;
}
