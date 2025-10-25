'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Box from '@mui/material/Box'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded'
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded'
import GroupsIcon from '@mui/icons-material/Groups'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import BottomSheet from './BottomSheet'

const navItems = [
  { label: 'Home', icon: <HomeRoundedIcon />, path: '/home' },
  { label: 'Liste', icon: <GroupsIcon />, path: '/participant' },
  { label: 'Wunschliste', icon: <CardGiftcardRoundedIcon />, path: '/wishpage' },
  { label: 'Los', icon: <ConfirmationNumberRoundedIcon />, path: '/draw' },
  { label: 'Mehr', icon: <MoreHorizRoundedIcon />, path: null },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const currentIndex = navItems.findIndex(
    (item) => item.path && pathname.startsWith(item.path)
  )

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'linear-gradient(to top, #ffffff, #f8f8f8)',
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          boxShadow: '0 -3px 15px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          borderTop: '3px solid rgba(255,255,255,0.8)',
          height: 70,
        }}
      >
        <BottomNavigation
          value={currentIndex === -1 ? 0 : currentIndex}
          onChange={(event, newValue) => {
            if (navItems[newValue].label === 'Mehr') {
              setSidebarOpen(true)
            } else {
              router.push(navItems[newValue].path)
            }
          }}
          showLabels
          sx={{
            height: '100%',
            background: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: '#9ca3af',
              minWidth: 0,
              fontWeight: 500,
              '&.Mui-selected': {
                color: '#dc2626',
              },
            },
            '& .Mui-selected svg': {
              transform: 'scale(1.2)',
              transition: 'transform 0.3s',
            },
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Box>

      <BottomSheet open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
