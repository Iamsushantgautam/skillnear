import React from 'react';
import { Search } from 'lucide-react';

const NavbarSearch = ({ searchKeyword, setSearchKeyword, handleSearch }) => {
    return (
        <div className="nav-search hide-on-mobile">
            <Search size={18} color="#6b7280" />
            <input
                type="text"
                placeholder="Search for services..."
                className="nav-search-input"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleSearch}
            />
        </div>
    );
};



export default NavbarSearch;
