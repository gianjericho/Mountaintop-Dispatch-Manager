"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { dispatchService, ServiceOrder } from '@/services/dispatchService';
import { useAuth } from '@/components/auth/AuthProvider';

interface DispatchContextType {
  orders: ServiceOrder[];
  teams: string[];
  areas: Record<string, string[]>;
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Filters
  searchField: string;
  setSearchField: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;
  teamFilter: string;
  setTeamFilter: (v: string) => void;
  areaFilter: string;
  setAreaFilter: (v: string) => void;
  barangayFilter: string;
  setBarangayFilter: (v: string) => void;
  
  // List configs
  sortBy: string;
  setSortBy: (v: string) => void;
  limit: number;
  setLimit: (v: number) => void;
  techDateMode: boolean;
  setTechDateMode: (v: boolean) => void;

  clearAllFilters: () => void;
}

const DispatchContext = createContext<DispatchContextType>({} as DispatchContextType);

// Using hardcoded dynamic areas based on the legacy app
const DYNAMIC_AREAS: Record<string, string[]> = {
  "Angono": ["Bagumbayan", "Kalayaan", "Mahabang Parang", "Poblacion Ibaba", "Poblacion Itaas", "San Isidro", "San Roque", "San Vicente", "Sto. Nino", "Kalayaan"],
  "Antipolo": ["Bagong Nayon", "Beverly Hills", "Calawis", "Cupang", "Dalig", "Dela Paz", "Inarawan", "Mambugan", "Mayamot", "Muntindilaw", "San Isidro", "San Jose", "San Juan", "San Luis", "San Roque", "Santa Cruz"],
  "Baras": ["Concepcion", "Evangelista", "Mabini", "Pinugay", "Rizal", "San Jose", "San Juan", "San Miguel", "San Salvador", "Santiago"],
  "Binangonan": ["Batingan", "Bilibiran", "Calumpang", "Darangan", "Kasile", "Layunan", "Libid", "Libis", "Lunsad", "Macamot", "Mahabang Parang", "Mambog", "Pag-Asa", "Palangoy", "Pantok", "Pila Pila", "San Carlos", "San Juan", "San Pedro", "San Vicente", "Tagpos", "Tatala", "Tayuman"],
  "Cainta": ["San Andres", "San Isidro", "San Juan", "San Roque", "Santa Rosa", "Santo Domingo", "Santo Nino"],
  "Cardona": ["Balibago", "Boor", "Calahan", "Dalig", "Del Remedio", "Iglesia", "Looc", "Luya", "Malanggam-Calubacan", "Nagsulo", "Navotas", "Patunhay", "Real", "Sampad", "San Roque", "Subay", "Ticulio", "Tuna"],
  "Jalajala": ["Bagumbong", "Bayugo", "Lubo", "Pagkalinawan", "Palaypalay", "Punta", "Sipsipin", "Special District", "Tala", "Jalajala"],
  "Morong": ["Bombongan", "Calingo", "Caniogan", "Lagundi", "Maybangcal", "San Guillermo", "San Jose", "San Juan", "San Pedro", "San Tomas"],
  "Pililla": ["Bagumbayan", "Halayhayin", "Hulo", "Imatong", "Malaya", "Niogan", "Quisao", "Takungan", "Wawa"],
  "Rodriguez": ["Balite", "Burgos", "Geronimo", "Macabud", "Manggahan", "Mascap", "Puray", "Rosario", "San Isidro", "San Jose", "San Rafael"],
  "San Mateo": ["Ampid I", "Ampid II", "Banaba", "Dulong Bayan 1", "Dulong Bayan 2", "Guinayang", "Guitnang Bayan I", "Guitnang Bayan II", "Maly", "Pintong Bukawe", "Santa Ana", "Santo Nino", "Silangan"],
  "Tanay": ["Cuyambay", "Daraitan", "Katipunan-Bayani", "Kaybuto", "Laiban", "Mag-Ampon", "Mamuyao", "Pinagkamaligan", "Plaza Aldea", "Sampaloc", "San Andres", "San Isidro", "Santa Inez", "Santo Nino", "Tabing Ilog", "Tandang Kutyo", "Tinucan", "Wawa"],
  "Taytay": ["Dolores", "Muzon", "San Isidro", "San Juan", "Santa Ana"],
  "Teresa": ["Bagumbayan", "Calumpang Santo Cristo", "Dalig", "Dulumbayan", "May-Iba", "Poblacion", "Prinza", "San Gabriel", "San Roque"],
  "Marikina": ["Barangka", "Calumpang", "Concepcion Uno", "Concepcion Dos", "Fortune", "Industrial Valley", "Jesus Dela Pena", "Malanday", "Marikina Heights", "Nangka", "Parang", "San Roque", "Santa Elena", "Santo Nino", "Tañong", "Tumana"]
};

export function DispatchProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchField, setSearchField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('');

  // List configs
  const [sortBy, setSortBy] = useState('default');
  const [limit, setLimit] = useState(50);
  const [techDateMode, setTechDateMode] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await dispatchService.fetchAllOrders();
      setOrders(data);
      
      // Extract unique teams
      const uniqueTeams = Array.from(new Set(data.map(o => o.team).filter(Boolean))).sort();
      setTeams(uniqueTeams);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user?.email]); // Re-fetch if actual user changes, but not just role impersonation

  const clearAllFilters = () => {
    setSearchQuery('');
    setDateFilter('');
    setTeamFilter('');
    setAreaFilter('');
    setBarangayFilter('');
  };

  return (
    <DispatchContext.Provider value={{
      orders, teams, areas: DYNAMIC_AREAS, loading, refreshData,
      searchField, setSearchField, searchQuery, setSearchQuery,
      dateFilter, setDateFilter, teamFilter, setTeamFilter,
      areaFilter, setAreaFilter, barangayFilter, setBarangayFilter,
      sortBy, setSortBy, limit, setLimit, techDateMode, setTechDateMode,
      clearAllFilters
    }}>
      {children}
    </DispatchContext.Provider>
  );
}

export const useDispatchData = () => useContext(DispatchContext);
