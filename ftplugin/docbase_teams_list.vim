nnoremap <buffer> <plug>(docbase-buffer-action-teams-list-open) <cmd>call docbase#buffer_action#teams_list#open(line("."))<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-teams-list-open-new) <cmd>call docbase#buffer_action#teams_list#open(line("."), {"split": "split-above"})<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-teams-list-open-vnew) <cmd>call docbase#buffer_action#teams_list#open(line("."), {"split": "split-left"})<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-teams-list-open-tabedit) <cmd>call docbase#buffer_action#teams_list#open(line("."), {"split": "split-tab"})<cr>
