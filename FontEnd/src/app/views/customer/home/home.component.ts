import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CakeService } from '../../../app-services/cake-service/cake.service';
import { Cake } from '../../../app-services/cake-service/cake.model';
import { CategoryService } from '../../../app-services/category-service/category.service';
import { Category } from '../../../app-services/category-service/category.model';
import { CakeFiter } from '../../../app-services/cake-service/cakefilter.model';
import { CartCakeService } from 'src/app/app-services/cartCake-service/cartCake.service';
import { CartCake } from 'src/app/app-services/cartCake-service/cartCake.model';
import { Point } from 'src/app/app-services/point-service/point.model';
import { PointService } from 'src/app/app-services/point-service/point.service';
import Swal from 'sweetalert2';
//recommend
import { BestService } from '../../../app-services/best-service/best.service';
import { Recommend } from '../../../app-services/recommendSys-service/recommendSys.service';
//favorite
import { Favorite } from 'src/app/app-services/favorite-service/favorite.model';
import { FavoriteService } from 'src/app/app-services/favorite-service/favorite.service';
import { AuthenticateService } from 'src/app/app-services/auth-service/authenticate.service';
//promotion
import{Promotion} from 'src/app/app-services/promotion-service/promotion.model';
import{PromotionService} from 'src/app/app-services/promotion-service/promotion.service';
declare var $: any;
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	success: Boolean = false;
	//
	customOptions: any
	constructor(private _router: Router, private cakeService: CakeService,private authService: AuthenticateService,
		private _cartCakeDBService: CartCakeService, private _pointService: PointService,private cartCakeService: CartCakeService
		,private cakeCategoryService: CategoryService, private _bestService: BestService,private _recommendSyS:Recommend,private _favoriteService:FavoriteService,private _promotion:PromotionService) {

	}
	//ch???a th??ng tin gi??? h??ng
	CartCake = [];
	TongTien = 0;
	TongCount = 0;
	point: Point = new Point;
	lengthCartCake = 0;
	accountSocial = JSON.parse(localStorage.getItem('accountSocial'));
	cartCakeDB: CartCake = new CartCake;

	isLoggedIn = false
	role: string = ''
	isCustomer = false
	cakeFilter: CakeFiter = new CakeFiter();
	//loai banh
	cakesCategory: []
	category_id: string;
	//recommend
	bestCakeList: Cake = new Cake;
	bestCategoryList: Category = new Category;
	CakeByListCategoryBest:any
	favorite: Favorite = new Favorite
	listFavorite :any
	IsNeedLoadRecommend=true;		//recommend ch??? ch???y 1 l???n th??i (????? ????? load nhi???u)
	ngOnInit() {
		this.cakeService.updateSalePromotion().subscribe(data2 => {
			  })
		this.getAllFavoriteByUserId();
		$('.searchHeader').attr('style', 'font-size: 1.6rem !important');
		this.script_Frontend();
		
		//this.refreshCartCakeList();
		this.getTotalCountAndPrice();
		this.get3Promotion();
		// recommend ch??? ch???y 1 l???n th??i (????? ????? load nhi???u)	(2 tr???ng th??i ????ng nh???p c?? s??? thay ?????i th?? m???i ch???y recommends)
		if(this.accountSocial!=null){
			localStorage.setItem("StatusLoginNow","true");
			if(localStorage.getItem("StatusLoginNow")!=localStorage.getItem("StatusLoginBefore"))
			{
				this.IsNeedLoadRecommend = true
				localStorage.setItem("StatusLoginBefore","true");
			}
		}else{
			localStorage.setItem("StatusLoginNow","false");
			if(localStorage.getItem("StatusLoginNow")!=localStorage.getItem("StatusLoginBefore"))
			{
				this.IsNeedLoadRecommend = true
				localStorage.setItem("StatusLoginBefore","false");
			}
		}
		if(JSON.parse(localStorage.getItem("listBestCake"))== null||this.IsNeedLoadRecommend==true){
			this.IsNeedLoadRecommend=false
			//this.getBestCakeAndRecommend();
		}
		this.LoadBestCakeAndRecommendSecond();
		this.checkCartCakeDBAndLocalStorage();

	    this.authService.authInfo.subscribe(val => {
			this.isLoggedIn = val.isLoggedIn;
			this.role = val.role;
			this.isCustomer = this.authService.isCustomer()
			this.accountSocial = JSON.parse(this.authService.getAccount())
			this.RecommendByUser();
		  });
		  
		  //this.category_id = localStorage.getItem('category_id');
		  this.getCakeByCategoryspcecial('5fe5a55531a1704d7086c60f');
		  this.refreshCategoryList();
		  this.refreshCakeList();
	}

	startPageCategories: Number;
  	paginationLimitCategories: Number;
	//recommend
	theloai1:any
	theloai2:any
	ListCakeCategory1:any
	ListCakeCategory2:any
	IsRecommend = false

	ListrateRecommend:any
	IsRateRecommend=false

	ListClickRecommend:any
	IsClickRecommend=false

	ListBuyRecommend:any
	IsBuyRecommend=false
	LoadBestCakeAndRecommendSecond(){
		if(localStorage.getItem("listBestCake")){
		this.bestCakeList = JSON.parse(localStorage.getItem("listBestCake"))[1] as Cake
		this.bestCategoryList =  JSON.parse(localStorage.getItem("listBestCake"))[0] as Category
		}
		this._bestService.getSomeNewSomeBuySomeRateBest().subscribe(
			listTop3=>{
				this.top3New = listTop3["CakeListNew"] as Cake
				this.top5Buy = listTop3["CakeListBuyMost"] as Cake
				this.top3Rate = listTop3["DataListRateMost"] as Cake
				console.log( listTop3["CakeListNew"])
			}
		)
	}
	//top3 show (new,buy,rate)
	top3New:any
	top5Buy:any
	top3Rate:any

	getBestCakeAndRecommend() {
		this._bestService.getCakeBestSelling().subscribe(
			listBestCake => {
				localStorage.setItem("listBestCake", JSON.stringify(listBestCake));
				this.bestCakeList = listBestCake[1] as Cake
				this.bestCategoryList = listBestCake[0] as Category
			});

	}
	RecommendByUser()
	{
		console.log(this.accountSocial)
			//get 2 th??? lo???i m?? ng?????i d??ng th??ch nh???t ????? show s???n ph???m theo th??? lo???i
			if(this.accountSocial != null){
				this._bestService.getCakeOnCategoryBuyMostByUserID(this.accountSocial._id).subscribe(
					listBestCakeOnCategory => {

						this.CakeByListCategoryBest = listBestCakeOnCategory as Cake
						if(this.CakeByListCategoryBest.length > 1)
						{
							this.IsRecommend = true
							this.theloai1=Object.keys(this.CakeByListCategoryBest[0])[0]
							this.theloai2=Object.keys(this.CakeByListCategoryBest[1])[0]
							this.ListCakeCategory1=Object.values(this.CakeByListCategoryBest[0])[0]
							this.ListCakeCategory2=Object.values(this.CakeByListCategoryBest[1])[0]
						}else{
							this.IsRecommend = false
						}

					});
				this._recommendSyS.getAllRecommendByUserID(this.accountSocial._id).subscribe(
					listAllRecommend =>{

						this.ListClickRecommend = listAllRecommend['click'] as Cake
						this.ListrateRecommend = listAllRecommend['rate'] as Cake
						this.ListBuyRecommend = listAllRecommend['buy'] as Cake

						if(this.ListClickRecommend.length>6)
						{
							this.IsClickRecommend=true
						}else{
							this.IsClickRecommend=false
						}

						if(this.ListrateRecommend.length>6)
						{
							this.IsRateRecommend=true
						}else{
							this.IsRateRecommend=false
						}

						if(this.ListBuyRecommend.length>6)
						{
							this.IsBuyRecommend=true
						}else{
							this.IsBuyRecommend=false
						}
					}
				)
			}
	}
	script_Frontend() {
		this.customOptions = {
			loop: false,
			mouseDrag: true,
			touchDrag: true,
			pullDrag: true,
			dots: true,
			navSpeed: 700,
			nav: false,
			navText: ['<img src = "../../assets/img/02/Previous.png" />',
				'<img src = "../../assets/img/02/Next.png" id = "btnNavRight"/>'],
			navClass: ['owl-prev', 'owl-next'],
			responsive: {
				0: {
					items: 1
				},
				400: {
					items: 2
				},
				740: {
					items: 3
				},
				940: {
					items: 4
				},
				1100: {
					items: 4
				}
			}
		}
		$(function () {
			$("#scrollToTopButton").click(function () {
				$("html, body").animate({ scrollTop: 0 }, 1000);
			});

		});
	}
	// set ????? d??i c???a gi??? h??ng
	cartCakeLength(CartCake) {
		if (CartCake == null) {
			this.lengthCartCake = 0;
		} else {
			this.lengthCartCake = CartCake.length;
		}
	}
	//get total count and price
	getTotalCountAndPrice() {
		this.TongTien = 0;
		this.TongCount = 0;		
		this.CartCake = JSON.parse(localStorage.getItem("CartCake"));
		this.cartCakeLength(this.CartCake);
		if (this.CartCake != null) {
			for (var i = 0; i < this.lengthCartCake; i++) {
				this.TongTien += parseInt((parseInt(this.CartCake[i].priceCake) * parseInt(this.CartCake[i].count)*(100-this.CartCake[i].sale)/100).toFixed(0));
				this.TongCount += parseInt(this.CartCake[i].count);
			}
		}
	
		$('#tongtien').html("&nbsp;" + this.formatCurrency(this.TongTien.toString()));
		$('.cart_items').html(this.TongCount.toString());
		localStorage.setItem("TongTien", this.TongTien.toString());
		localStorage.setItem("TongCount", this.TongCount.toString());
		
	}
	//#endregion
	formatCurrency(number) {
		var n = number.split('').reverse().join("");
		var n2 = n.replace(/\d\d\d(?!$)/g, "$&,");
		return n2.split('').reverse().join('') + 'VN??';
	}
	showCategory(id: String) {
		var category: any;
		this.cakeCategoryService.getCategoryById(id).subscribe((res) => {
		  this.cakeCategoryService.categories = res as Category[];
		  category = res;
		});
	  }
	goToCategory(id) {
		return this._router.navigate(['/rountlv2/category/' + `/${id}`])
	  }
	  goToSale() {
		return this._router.navigate(['/rountlv2/sale/listSale'])
	  }


	moveToShop() {
		return this._router.navigate(['/cakesCategory']);
	}

	moveToCakeCategory() {
		return this._router.navigate(['/cakesCategory']);
	}
	moveToCakeDetail() {
		return this._router.navigate(['/cakeDetail']);
	}
	selectedCake = [];
	detailCake(cake: Cake) {

		return this._router.navigate(["/cakeDetail" + `/${cake._id}`]);
	}
	refreshCakeList() {
		this.cakeService.getCakeList().subscribe((res) => {
			this.cakeService.cake = res as Cake[];
		});
	}
	refreshCategoryList() {
		this.cakeCategoryService.getCategoryList().subscribe((res) => {
		  this.cakeCategoryService.categories = res as Category[];
		 	});
	  }
	refreshCartCakeList() {
		this.cartCakeService.getCartCakeList().subscribe((res) => {
			this.cartCakeService.cartCake = res as CartCake[];
		});
	}
	//Ki???m tra so s??nh cartcakeLocal v?? cartcakeDB
	checkCartCakeDBAndLocalStorage() {
		if (JSON.parse(localStorage.getItem('accountSocial')) != null) {
			this._cartCakeDBService.getAllCartCakeDBByUserID(this.accountSocial._id).subscribe(
				cartCakeDB => {
					//ki???m tra xem cartcake v?? cartcakeDB c?? kh???p kh??ng
					if (this.lengthCartCake == 0) {
						//load cartcakeDB by userID l??n localStosrage (neu co)
						this.CartCake = cartCakeDB as Cake[]
						localStorage.setItem("CartCake", JSON.stringify(this.CartCake));
						this.getTotalCountAndPrice();
					} else if (Object.keys(cartCakeDB).length == 0) {
						for (var i = 0; i < this.lengthCartCake; i++) {
							this.postCartCakeDB(this.CartCake[i]);
						}
					}
					else if (Object.keys(cartCakeDB).length != this.lengthCartCake) {
						//x??a h???t db user // l??u l???i m???i theo localstorage
						this.mergeCartCakeAndCartCakeDB(cartCakeDB);

					} else {
						var temp = 0
						// ki???m tra c??c value b??n trong
						for (var i = 0; i < this.lengthCartCake; i++) {
							for (var j = 0; j < Object.keys(cartCakeDB).length; j++) {
								if (this.CartCake[i]._id == Object.values(cartCakeDB)[j]._id) {
									if (this.CartCake[i].count == Object.values(cartCakeDB)[j].count) {
										temp++;
									}
								}
							}
						}
						if (temp != this.lengthCartCake) {
							//x??a h???t db user // l??u l???i m???i theo localstorage
							this.mergeCartCakeAndCartCakeDB(cartCakeDB);
						}
					}

				},
				error => console.log(error)
			);
			//get point user by userID
			this._pointService.getPointByUserID(this.accountSocial._id).subscribe(
				Point => {

					//n???u ch??a t???o Point th?? set = 0
					if (Object.keys(Point).length == 0) {
						this.point.userID = this.accountSocial._id;
						this.point.point = 0;
						this._pointService.postPoint(this.point).subscribe(
							pointNew => {
								localStorage.setItem("Point", Object.values(pointNew)[0].point);
							}
						);
					} else {
						console.log(Object.values(Point)[0].point);
						localStorage.setItem("Point", Object.values(Point)[0].point);
					}
				},
				error => console.log(error)
			);
		}
	}
	//x??a h???t db by UserID
	deleteAllCartCakeDBByUserID(id) {
		if (JSON.parse(localStorage.getItem('accountSocial')) != null) {

			this._cartCakeDBService.deleteAllCartCakeByUserID(id).subscribe(
				req => {
					for (var i = 0; i < this.lengthCartCake; i++) {
						this.postCartCakeDB(this.CartCake[i]);
					}
				},
				error => console.log(error)
			);
		}
	}
	//
	postCartCakeDB(selectedCake: Cake) {
		if (JSON.parse(localStorage.getItem('accountSocial')) != null) {
			this.cartCakeDB.userID = this.accountSocial._id;
			this.cartCakeDB.cakeID = selectedCake._id;
			this.cartCakeDB.count = selectedCake.count;
			this._cartCakeDBService.postCartCake(this.cartCakeDB).subscribe(
				req => {
					console.log(req);
				},
				error => console.log(error)
			);
		}
	}
	getCakeById(id: string) {
		this.cakeService.getCakeById(id).subscribe((res) => {

		});
	}
	//X??a h???t DB l??u l???i theo gi??? h??ng
	mergeCartCakeAndCartCakeDB(cartCakeDB: Object) {
		Swal.fire({
			text: "Gi??? h??ng c?? c???a b???n ch??a ???????c thanh to??n ,b???n c?? mu???n g???p gi??? h??ng c?? v??o kh??ng ?",
			icon: 'warning',
			showCancelButton: true,  
      confirmButtonText: 'Ok',  
      cancelButtonText: 'Cancel'
		  }).then((willDelete) => {
			if(willDelete){

			//g???p cartcake
			for (var i = 0; i < Object.keys(cartCakeDB).length; i++) {
				for (var j = 0; j < this.lengthCartCake; j++) {
					if (this.CartCake[j]._id == Object.values(cartCakeDB)[i]._id) {
						this.CartCake[j].count += Object.values(cartCakeDB)[i].count;
						if (this.CartCake[j].count > 10) {
							this.CartCake[j].count = 10;
						}
						break;
					}
					if (j == this.lengthCartCake - 1) {
						//add
						this.CartCake.push(Object.values(cartCakeDB)[i]);
					}
			}
			localStorage.setItem("CartCake", JSON.stringify(this.CartCake));
			this.getTotalCountAndPrice();
		}
		this.deleteAllCartCakeDBByUserID(this.accountSocial._id);
		Swal.fire({
            title: "",
            text: "G???p gi??? h??ng th??nh c??ng",
            icon: 'success'
          });
			}

		});

	}


	//#region go To Cake Detail
	clickGoToCakeDetail(id) {
		return this._router.navigate(['/cakeDetail/' + id]);
	}
	//#endregion
	//#region  Add Cake Cart

	putCartCakeDB(selectedCake: Cake) {
		if (JSON.parse(localStorage.getItem('accountSocial')) != null) {
			this.cartCakeDB.userID = this.accountSocial._id;
			this.cartCakeDB.cakeID = selectedCake._id;
			this.cartCakeDB.count = selectedCake.count;
			this._cartCakeDBService.putCartCake(this.cartCakeDB).subscribe(
				req => {
					console.log(req);
				},
				error => console.log(error)
			);
		}
	}
	// check count cart before add (hover )
	checkCountMax10 = true;
	checkCountCartBeforeAdd(selectedCake: Cake) {
		this.checkCountMax10 = true;
		for (var i = 0; i < this.lengthCartCake; i++) {
			if (this.CartCake[i]._id == selectedCake._id) {
				//ki???m tra s??? l?????ng
				if (this.CartCake[i].count == 10) {
					this.checkCountMax10 = false;
				}
				console.log(this.CartCake[i].count);
			}
		}
	}
	addACake = "";
	alertMessage = "";
	alertSucess = false;
	alertFalse = false;
	//add to cart (CakeDetail,CountSelect)
	// s??? l?????ng t???i ??a ch??? ???????c 10 m???i qu???n s???n ph???m , t??nh lu??n ???? c?? trong gi???

	checkedAddCake = true;
	addToCart(selectedCake: Cake) {
		this.getCakeByCategory(selectedCake.categoryID)
		this.addACake = selectedCake.nameCake;
		var CartCake = [];    //l??u tr??? b??? nh??? t???m cho localStorage "CartCake"
		var dem = 0;            //V??? tr?? th??m s???n ph???m m???i v??o localStorage "CartCake" (n???u s???n ph???m ch??a t???n t???i)
		var temp = 0;           // ????nh d???u n???u ???? t???n t???i s???n ph???m trong localStorage "CartCake" --> count ++
		// n???u localStorage "CartCake" kh??ng r???ng

		if (localStorage.getItem('CartCake') != null) {
			//ch???y v??ng l???p ????? l??u v??o b??? nh??? t???m ( t???o m???ng cho Object)

			for (var i = 0; i < JSON.parse(localStorage.getItem("CartCake")).length; i++) {
				CartCake[i] = JSON.parse(localStorage.getItem("CartCake"))[i];
				// n???u id cake ???? t???n t???i trong  localStorage "CartCake"
				if (CartCake[i]._id == selectedCake._id) {
					temp = 1;  //?????t bi???n temp
					// n???u s??? l?????ng t???i ??a ch??? ???????c 10 m???i s???n ph???m , t??nh lu??n ???? c?? trong gi??? th?? oke
					if (parseInt(CartCake[i].count) + 1 <= 10) {
						CartCake[i].count = parseInt(CartCake[i].count) + 1;  //t??ng gi?? tr??? count
						//c???p nh???t cartcake v??o db
						this.putCartCakeDB(CartCake[i]);
					}
					else {
						//show alert
						this.checkedAddCake = false;
						//update l???i s??? l?????ng


						this.alertMessage = "???? t???n t???i 10 s???n ph???m " + CartCake[i].nameCake + " trong gi??? h??ng";
						this.alertFalse = true;
						setTimeout(() => { this.alertMessage = ""; this.alertFalse = false }, 4000);
					}
				}
				dem++;  // ?????y v??? tr?? g??n ti???p theo
			}
		}

		if (temp != 1) {      // n???u sp ch??a c?? ( temp =0 ) th?? th??m sp v??o
			selectedCake.count = 1;  // set count cho sp
			CartCake[dem] = selectedCake; // th??m s???n ph???m v??o v??? tr?? "dem" ( v??? tr?? cu???i)
			//l??u cartcake v??o db
			this.postCartCakeDB(selectedCake);
		}
		//this.refreshCartCakeList();
		// ????? m???ng v??o localStorage "CartCake"
		localStorage.setItem("CartCake", JSON.stringify(CartCake));
		this.getTotalCountAndPrice();
		//  //show alert
		//  this.alertMessage="Th??m th??nh c??ng s???n ph???m "+ selectedCake.nameCake +" v??o gi??? h??ng";
		//  this.alertSucess=true;
		//  setTimeout(() => {this.alertMessage="";this.alertSucess=false}, 6000);

	}
	//#endregion

	goToCartCake(){
		return this._router.navigate(['/cartCake']);
	}
	CakeByCategory: any;
	getCakeByCategory(idCategory){
		this.cakeService.getCakeByCategoryId(idCategory)
		.subscribe(resCategoryData => {
		  this.CakeByCategory = resCategoryData as Cake[];
		  console.log(this.CakeByCategory);
		});
		this.refreshCakeList();
  	}
	  getCakeByCategoryspcecial(idCategory){
		this.cakeService.getCakeByCategoryIdspecial(idCategory)
		.subscribe(resCategoryData => {
		  this.CakeByCategory = resCategoryData as Cake[];
		  console.log(this.CakeByCategory);
		});
		this.refreshCakeList();
  	}
  goToHome(){
    this._router.navigate(['/homePage'])
  }

	// favorite Cake
	favoriteCake(cakeID){
		if (JSON.parse(localStorage.getItem('accountSocial')) != null) {
		this.favorite.cakeID=cakeID;
		this.favorite.userID=this.accountSocial._id
		this._favoriteService.postFavorite(this.favorite).subscribe(
			aFavorite=>{ // aFavorite s??? tr??? v??? all favorite by userID
				this.listFavorite = aFavorite as Favorite[];
		})
	}else{
		this.alertMessage = "B???n ph???i ????ng nh???p ????? th???c hi???n thao t??c n??y";
		this.alertFalse = true;
		setTimeout(() => { this.alertMessage = ""; this.alertFalse = false }, 4000);
	}
	}
	getAllFavoriteByUserId(){
		if (JSON.parse(localStorage.getItem('accountSocial')) != null) {
		this._favoriteService.getAllFavoriteByUserID(this.accountSocial._id).subscribe(
			listFavorites =>{
				this.listFavorite = listFavorites as Favorite[];
			}
		)
	}
}
//validate favorite
validateFavorite(id) {
	if (JSON.parse(localStorage.getItem('accountSocial')) != null) {
	for(let index in this.listFavorite)
	{
		if(id==this.listFavorite[index].cakeID)
		return true;
	}
	return false
  }
  return false
}

//get 3 promotion
ListPromotion:any
get3Promotion(){
	this._promotion.getTop3Promotion().subscribe(list=>{
		this.ListPromotion = list as Promotion
		console.log(this.ListPromotion)
	})
}
}


