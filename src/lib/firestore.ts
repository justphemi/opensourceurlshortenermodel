import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment,
  arrayUnion,
  query,
  getDocs,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { getCountry } from './country';

export interface ClickData {
  timestamp: number;
  country: string;
  source: string;
  ipHash: string;
}

export interface LinkData {
  title: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: number;
  createdFrom: string;
  deviceId: string;
  cCode: string;
  totalClicks: number;
  uniqueClicks: number;
  clicks: ClickData[];
}

const hashIP = async (ip: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
};

export const addLink = async (
  title: string, 
  slug: string, 
  originalUrl: string, 
  deviceId: string
): Promise<void> => {
  // Check if slug already exists
  const linkRef = doc(db, 'links', slug);
  const linkSnap = await getDoc(linkRef);
  
  if (linkSnap.exists()) {
    throw new Error('Slug already exists');
  }
  
  const country = await getCountry();
  const shortUrl = `${window.location.origin}/${slug}`;
  
  const linkData: LinkData = {
    title,
    slug,
    originalUrl,
    shortUrl,
    createdAt: Date.now(),
    createdFrom: country.country,
    cCode: country.countryCode,
    deviceId,
    totalClicks: 0,
    uniqueClicks: 0,
    clicks: []
  };
  
  await setDoc(linkRef, linkData);
};

export const getLink = async (slug: string): Promise<LinkData | null> => {
  const linkRef = doc(db, 'links', slug);
  const linkSnap = await getDoc(linkRef);
  
  if (!linkSnap.exists()) {
    return null;
  }
  
  return linkSnap.data() as LinkData;
};

export const logClick = async (
  slug: string, 
  country: string, 
  referrer: string
): Promise<void> => {
  // Get IP hash (using a simple client identifier for demo)
  const clientId = navigator.userAgent + navigator.language;
  const ipHash = await hashIP(clientId);
  
  const linkRef = doc(db, 'links', slug);
  const linkSnap = await getDoc(linkRef);
  
  if (!linkSnap.exists()) {
    return;
  }
  
  const linkData = linkSnap.data() as LinkData;
  const existingIpHashes = linkData.clicks.map(c => c.ipHash);
  const isUniqueClick = !existingIpHashes.includes(ipHash);
  
  const clickData: ClickData = {
    timestamp: Date.now(),
    country,
    source: referrer || 'direct',
    ipHash
  };
  
  await updateDoc(linkRef, {
    totalClicks: increment(1),
    uniqueClicks: isUniqueClick ? increment(1) : linkData.uniqueClicks,
    clicks: arrayUnion(clickData)
  });
};

export const updateTitle = async (
  slug: string, 
  newTitle: string, 
  deviceId: string
): Promise<void> => {
  const linkRef = doc(db, 'links', slug);
  const linkSnap = await getDoc(linkRef);
  
  if (!linkSnap.exists()) {
    throw new Error('Link not found');
  }
  
  const linkData = linkSnap.data() as LinkData;
  
  if (linkData.deviceId !== deviceId) {
    throw new Error('Unauthorized');
  }
  
  await updateDoc(linkRef, {
    title: newTitle
  });
};

export const checkSlugAvailability = async (slug: string): Promise<boolean> => {
  const linkRef = doc(db, 'links', slug);
  const linkSnap = await getDoc(linkRef);
  return !linkSnap.exists();
};

export const getAllLinks = async (): Promise<LinkData[]> => {
  const linksRef = collection(db, 'links');
  const q = query(linksRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as LinkData);
};

export const getUserLinks = async (deviceId: string): Promise<LinkData[]> => {
  const linksRef = collection(db, 'links');
  const q = query(linksRef, where('deviceId', '==', deviceId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as LinkData);
};

export const getUniqueUsersCount = async (): Promise<number> => {
  const linksRef = collection(db, 'links');
  const querySnapshot = await getDocs(linksRef);
  
  const uniqueDeviceIds = new Set(
    querySnapshot.docs.map(doc => (doc.data() as LinkData).deviceId)
  );
  
  return uniqueDeviceIds.size;
};
