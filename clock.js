function modifyTimeWithZero(i) {
    // Add zero in front of numbers which are less than 10
    if (i < 10){
        i = "0" + i
    };

    return i;
}

function Clock(){

    const [time, setTime] = React.useState(new Date());
  
    // Update the time every second
    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
    
        // Clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);
    
    let h = time.getHours();
    let m = time.getMinutes();
    let s = time.getSeconds();

    m = modifyTimeWithZero(m);
    s = modifyTimeWithZero(s);

    let timeString = `${h}:${m}:${s}`;
    
    console.log(timeString);

    return (
        <div>{timeString}</div>
    );
}

ReactDOM.createRoot(
    document.getElementById("clock")
)
.render(
    <Clock/>
);
