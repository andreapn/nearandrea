import React from 'react'

interface GreetingProps {
    greeting: any
}

const Greeting: React.FC<GreetingProps> = ({ greeting }) => {
    return (
        <div>{greeting} </div>
    )
}

export default Greeting;
