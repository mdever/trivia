import AppLoadingContext from './context/AppLoadingContext';


export default function(props) {
    return (
        <AppLoadingContext.Provider value={props.setAppLoading}>
            <div style={{minHeight: '600px'}} className="container">
                { props.children }
            </div>
        </AppLoadingContext.Provider>
    )
}
