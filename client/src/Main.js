import './Main.css';

export default function(props) {
    return (
        <div id="main" className="container">
            { props.children }
        </div>
    )
}
