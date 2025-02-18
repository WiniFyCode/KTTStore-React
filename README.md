# KTT STORE
Coupons Management
1 GET /api/admin/categories
2 GET /api/admin/coupons/admin/coupons
3 POST /api/admin/coupons/admin/coupons/create
4 PUT /api/admin/coupons/admin/coupons/update/${editingCoupon.couponID}
5 DELETE /api/admin/coupons/admin/coupons/delete/${couponID}
6 PATCH /api/admin/coupons/admin/coupons/toggle/${couponID}

Customer Management
1 GET /api/admin/users/admin/users
2 PATCH /api/admin/users/admin/users/toggle/${userID}
3 PUT /api/admin/users/admin/users/${editingCustomer.userID}

Dashboard
1 GET /api/products/all-by-categories
2 GET /api/admin/users
3 GET /api/admin/orders/admin/orders
4 GET /api/admin/coupons/admin/coupons
5 GET /api/admin/promotions/all
6 GET /api/admin/notifications/admin/notifications
7 GET /api/reviews/admin/all

Notification Management
1 GET /api/admin/notifications/admin/notifications
2 GET /api/admin/users
3 PUT /api/admin/notifications/admin/notifications/update/${selectedNotification.notificationID}
4 POST /api/admin/notifications/admin/notifications/create
5 DELETE /api/admin/notifications/admin/notifications/delete/${id}

Order Management
1 GET /api/admin/orders/admin/orders
2 GET /api/admin/order-details/${orderId}
3 PUT /api/admin/order-details/${orderId}
4 GET /api/admin/order-details/${order.orderID}
5 PATCH /api/admin/orders/admin/orders/update/${selectedOrder.orderID}
6 DELETE /api/admin/orders/admin/orders/delete/${orderToDelete.orderID}

Product Management
1 GET /api/admin/products/admin/products
2 GET /api/categories
3 GET /api/targets
4 GET /api/admin/products/admin/products/${product.productID}
5 PUT /api/admin/products/admin/products/update/${editingProduct.productID}
6 GET /api/admin/products/admin/products/${product.productID}
7 PUT /api/admin/product-size-stock/admin/product-size-stock/update/${SKU}
8 PUT /api/admin/product-colors/admin/product-colors/add/${color.colorID}/images
9 DELETE /api/admin/product-colors/admin/product-colors/delete/${color.colorID}/images
10 POST /api/admin/product-colors/admin/product-colors/add/${selectedProductForColorSize.productID}
11 GET /api/admin/products/admin/products/${selectedProductForColorSize.productID}
12 DELETE /api/admin/product-colors/admin/product-colors/delete/${color.colorID}
13 GET /api/admin/products/admin/products/${selectedProductForColorSize.productID}
14 POST /api/admin/products/admin/products/create
15 DELETE /api/admin/products/admin/products/delete/${product.productID}
16 PATCH /api/admin/products/admin/products/toggle/${product.productID}

Promotion Management
1 GET /api/admin/promotions/all
2 GET /api/products
3 GET /api/categories
4 POST /api/admin/promotions/create
5 PUT /api/admin/promotions/update/${editingPromotion.promotionID}
6 DELETE /api/admin/promotions/delete/${id}
7 PATCH /api/admin/promotions/toggle-status/${promotionId}

FORGOT PASSWORD
1 POST /api/auth/forgot-password
2 POST /api/auth/reset-password

LOGIN
1 POST /api/auth/login

PROFILE
1 GET /api/user/profile
2 GET /api/address
3 GET /api/order/my-orders
4 GET /api/favorite
5 GET /api/reviews/user
6 GET /api/user-coupon/my-coupons
7 GET /api/user-notification
8 GET /api/reviews/user
9 GET /api/order/my-orders
10 GET /api/order/my-orders
11 GET /api/reviews/user
12 GET /api/promotions/active
13 PATCH /api/address/${addressID}/default
14 PUT /api/address/${editingAddress}
15 POST /api/address
16 DELETE /api/address/${addressID}
17 PUT /api/user/change-password
18 PUT /api/user/profile

REGISTER
1 POST /api/auth/register

CART
1 GET /api/cart
2 PUT /api/cart/${cartID}
3 DELETE /api/cart/${cartID}
4 DELETE /api/cart/${deletingItem}
5 POST /api/user-coupon/apply
6 GET /api/user-coupon/available

CHECKOUT
1 GET /api/address
2 POST /api/order/confirm-payment/${orderID}
3 POST /api/order/create

COUPONS
1 GET /api/user-coupon/my-coupons

NOTIFICATION
1 GET /api/user-notification
2 PUT /api/user-notification/${userNotificationID}/read
3 PUT /api/user-notification/mark-all-read

ORDER
1 GET /api/order/my-orders
2 POST /api/order/cancel/${orderId}

ORDER DETAIL
1 GET /api/order/my-orders/${id}
2 POST /api/order/cancel/${id}

MEN PRODUCTS
1 GET /api/products/gender?${params}

WOMEN PRODUCTS
1 GET /api/products/gender?${params}

NEW ARRIVALS
1 GET /api/products/basic

PRODUCT DETAIL
1 GET /api/products/${id}
2 GET /api/product-size-stock/color/${color.colorID}
3 GET /api/favorites/check/${SKU}
4 GET /api/reviews/product/${id}
5 POST /api/reviews/
6 DELETE /api/reviews/${reviewID}
7 PUT /api/reviews/${reviewID}
8 GET /api/product-size-stock/color/${color.colorID}
9 POST /api/cart/add
10 GET /api/product-size-stock/color/${color.colorID}
11 DELETE /api/favorite/${SKU}
12 POST /api/favorite/add

PRODUCTS
1 GET /api/products/basic?${params.toString()}
2 GET /api/promotions/active

SALE PRODUCTS
1 GET /api/products/basic

TET COLLECTION
1 GET /api/products/basic

PROMOTION
1 GET /api/promotions/active

CONTACT
1 POST /api/support/contact

WISHLIST
1 GET /api/favorite
2 POST /api/cart/add
3 DELETE /api/favorite/${SKU}
4 PUT /api/favorite/${favoriteID}

HOME
1 GET /api/products/basic
2 POST /api/subscriptions

REVIEW
1 GET /api/reviews/user
2 POST /api/reviews/create