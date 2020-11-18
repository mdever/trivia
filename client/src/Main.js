import './Main.css';

export default function(props) {
    return (
        <div id="main">
            <h3>In Main Element</h3>
            { props.children }
        </div>
    )
}
