import './Main.css';
import AppLoadingContext from './context/AppLoadingContext';


export default function(props) {
    return (
        <AppLoadingContext.Provider value={props.setAppLoading}>
            <div id="main" className="container">
                { props.children }
            </div>
        </AppLoadingContext.Provider>
    )
}
