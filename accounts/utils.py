def detectUser(user):
    if user.role == 1:
        redirectUrl = 'vendorDashboard'
    elif user.role == 2:
        redirectUrl = 'custDashboard'
    elif user.role == None and user.is_superadmin:
        redirectUrl = '/admin'
    return redirectUrl
