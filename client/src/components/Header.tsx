import { useSelector } from "react-redux"
import { isAuthenticated } from "../store/userSlice"
import CSS from 'csstype';

const headerStyles: CSS.Properties = {
    maxHeight: '200px', 
};

const navStyles: CSS.Properties = {

}

const ulStyles: CSS.Properties = {
    listStyle: 'none',
};

const liStyles: CSS.Properties = {
    display: 'inline',
    marginRight: '1rem',
}

export default function Header() {
    const authenticated = useSelector(isAuthenticated);

    return (
        <header style={headerStyles}>
            <ul style={ulStyles}>
                <li style={liStyles}>
                    First
                </li>
                <li style={liStyles}>Second</li>
            </ul>
        </header>
    )
}