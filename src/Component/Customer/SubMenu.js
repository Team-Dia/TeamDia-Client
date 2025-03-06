import React from 'react'
import { Link } from 'react-router-dom'

function SubMenu() {
    return (
        <div className='submenu'>
            <Link to='/customer'>오시는 길</Link>
            <Link to='/qna'>Q & A</Link>
        </div>
    )
}

export default SubMenu
