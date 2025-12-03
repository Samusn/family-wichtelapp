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
import Badge from '@mui/material/Badge'
import BottomSheet from './BottomSheet'
import { useSecretMessages } from './SecretMessageContext'

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
  const { unreadCount } = useSecretMessages()

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
          boxShadow: '0 -3px 15px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          borderTop: '3px solid rgba(255,255,255,0.9)',
          height: 78,                     // ⬅ Größer für bessere Touch-Hitboxes
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <BottomNavigation
          value={currentIndex === -1 ? 0 : currentIndex}
          onChange={(event, newValue) => {
            if (navItems[newValue].label === 'Mehr') {
              setSidebarOpen(true)
            } else {
              router.push(navItems[newValue].path!)
            }
          }}
          showLabels
          sx={{
            height: '100%',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',

            '& .MuiBottomNavigationAction-root': {
              minWidth: 60,                // ⬅ Größere Klickfläche
              padding: '10px 0',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              color: '#9ca3af',
              fontWeight: 600,
              fontSize: 12,

              '&:active': {
                transform: 'scale(0.92)', // ⬅ besseres Klickgefühl
                transition: 'transform 0.05s',
              },

              // Ripple entfernen -> besser für mobile Genauigkeit
              '& .MuiTouchRipple-root': {
                display: 'none',
              },

              '&.Mui-selected': {
                color: '#dc2626',
              },
            },

            '& .Mui-selected svg': {
              transform: 'scale(1.26)',
              transition: 'transform 0.25s ease',
            },
          }}
        >
          {navItems.map((item) => {
            // Badge nur für "Los" Tab (Draw) anzeigen
            const showBadge = item.label === 'Los' && unreadCount > 0
            return (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={
                  showBadge ? (
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )
                }
              />
            )
          })}
        </BottomNavigation>
      </Box>

      <BottomSheet open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
