import React, {useEffect, useRef, useState} from 'react';
import Header from "../../components/common/Header/Header";
import Input from "../../components/view/Input/Input";
import StepperFragment from "../../components/view/StepperFtagment/StepperFragment";
import Step from "../../components/view/StepperFtagment/Step/Step";
import Button from "../../components/view/Button/Button";
import {useRouter} from "next/router";
import Dimmer from "../../components/view/Dimmer/Dimmer";
import {uploadBookFile} from "../../Requests/uploadRequests";
import CircularProgressBar from "../../components/view/CircularProgressBar/CircularProgressBar";
import FileUploadSVG from "../../assets/svgs/fileUpload.svg";
import EmptyFileSVG from "../../assets/svgs/emptyFile.svg";
import FileSVG from "../../assets/svgs/file.svg";
import {gql, useMutation} from "@apollo/client";
import Toman from '../../assets/svgs/toman.svg'
import BookCategories from "../../components/normal/BookCategories/BookCategories";
import BookAppearance from "../../components/normal/BookAppearance/BookAppearance";
import {EditBookData, isBrochure, lastBookSubmitSuccess} from "../../store/books";
import Trash from '../../assets/svgs/trash.svg'
import TelInputSVG from "../../assets/svgs/telInput.svg";
import BoldMobile from "../../assets/svgs/boldMobile.svg";
import RightSquareSVG from "../../assets/svgs/rightSquare.svg";
import Toast from "../../components/normal/Toast/Toast";
import {ToastContainer} from "react-toastify";
import _ from 'lodash'
import {fixPrice} from "../../helpers/fixPrice";
import BookImageUpload from "../../components/normal/BookImageUpload/BookImageUpload";
import produce from "immer";
import {DOWNLOAD_HOST} from "../../store/GLOBAL_VARIABLES";

const NewBook = () => {


    //queries

    const createBookMutation = gql`
        mutation createBookTemplate($isBook:Boolean! $pages:Int $isDownloadable:Boolean! $isPurchasable:Boolean! $categoryID:ID! $title:String $details:String $price:Int $language:String $writer:String $publisher:String $publishedDate:Int $appearanceID:ID $attachments:[UploadedFileInput] $bookFiles:[UploadedFileInput] ){
            createBookTemplate(
                isBook:$isBook,
                isDownloadable: $isDownloadable,
                isPurchasable: $isPurchasable,
                categoryID: $categoryID,
                title: $title,
                details: $details,
                price: $price,
                language: $language,
                writer: $writer,
                publisher: $publisher,
                publishedDate: $publishedDate,
                appearanceID: $appearanceID
                bookFiles: $bookFiles,
                attachments: $attachments,
                pages:$pages
            ){
                status
                data {
                    title
                    id
                }
                message
            }
        }
    `

    const updateBookMutation = gql`
        mutation updateBook($id:ID!  $isDownloadable:Boolean! $isPurchasable:Boolean! $categoryID:ID! $title:String $details:String $price:Int $language:String $writer:String $publisher:String $publishedDate:Int $appearanceID:ID $attachments:[UploadedFileInput] $bookFiles:[UploadedFileInput] $connectWay:String!){
            updateBook(
                id: $id
                isDownloadable: $isDownloadable,
                isPurchasable: $isPurchasable,
                categoryID: $categoryID,
                title: $title,
                details: $details,
                price: $price,
                language: $language,
                writer: $writer,
                publisher: $publisher,
                publishedDate: $publishedDate,
                appearanceID: $appearanceID
                bookFiles: $bookFiles,
                attachments: $attachments,
                connectWay:$connectWay
            ){
                status
                data {
                    title
                    id
                }
                message
            }
        }
    `

    const [createBook, createBookResult] = useMutation(createBookMutation)
    const [updateBook, updateBookResult] = useMutation(updateBookMutation)


    const router = useRouter()
    const [currentStep, ScurrentStep] = useState(0)
    const [isBook, _isBook] = useState(false)
    const [loading, Sloading] = useState(false)
    const [dimmer, Sdimmer] = useState(false)
    const [langDropDown, SlangDropDown] = useState(false)
    const [uploadedImages, setUploadedImages] = useState([] as string[])
    const [uploadingProgress, setUploadingProgress] = useState([] as number[])
    const [loadingDialog, setLoadingDialog] = useState(false)
    const priceInputRef = useRef(null)
    const [isBookFree, setIsBookFree] = useState(false)
    const currentBookId = useRef((Math.floor(Math.random() * 9999999999)).toString())
    const [categoryComponent, _categoryComponent] = useState(false)
    const [appearanceComponent, _appearanceComponent] = useState(false)
    const [uploadedFile, _uploadedFile] = useState('')
    const [fileUploadingPercentage, _fileUploadingPercentage] = useState('0')
    const [contactType, setContactType] = useState('')
    const [contactAddress, setContactAddress] = useState('')
    const [connectWay, setConnectWay] = useState('')
    const [langPosition, _langPosition] = useState([1000, 1000]);
    const selectLangRef = useRef<HTMLSpanElement>(null);
    const mainScroller = useRef<HTMLDivElement>(null);
    const lastPrice = useRef("");
    const [bookUploadState, setBookUploadState] = useState('');
    const [fileSize, setFileSize] = useState(0);
    const [fileName, setFileName] = useState("");
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [BookData, setBookData] = useState({
        type: 'physical',
        price: 20000,
        attachments: [],
        files: [],
        fileNames: []
    } as {
        id: string
        isBook: boolean
        title: string
        writer: string
        language: string
        appearance: string
        appearanceID: string
        details: string
        type: string
        price: number
        pages: number
        categoryID: string
        categoryPersian: string
        publisher: string
        publishedDate: string
        files: []
        attachments: []
        fileNames: []
    })


    useEffect(() => {
        if (Object.keys(EditBookData()).length) {
            setEditing(() => {
                return true
            })

            console.log(EditBookData())
            try {

                updateBookData('title', EditBookData()?.title)
                updateBookData('id', EditBookData()?.id)
                if (EditBookData().appearance)
                    updateBookData('appearance', EditBookData().appearance.title)
                if (EditBookData().category)
                    updateBookData('categoryPersian', EditBookData().category.title)
                updateBookData('categoryID', EditBookData().categoryID)
                updateBookData('details', EditBookData().details)
                updateBookData('writer', EditBookData().writer)
                updateBookData('publishedDate', EditBookData().publishedDate)
                updateBookData('price', parseInt(EditBookData().price))

                updateBookData('publisher', EditBookData().publisher ?? '')

                setConnectWay(EditBookData().connectWay)
                setContactType(EditBookData().connectWay[0] === "0" ? 'phone' : 'telegram')
                updateBookData('language', EditBookData().language)
                // updateBookData('attachments', EditBookData().attachments)
                let imagesArr = [] as any[]
                let attachments = [] as any[]
                let imagesArrString = [] as any[]
                if (EditBookData().attachments) {
                    (EditBookData().attachments as []).map((attachment) => {
                        imagesArr.push(attachment)
                    })
                }
                imagesArr.forEach((e) => {
                    attachments.push((_.omit(e, ['__typename'])).test = "e")
                    imagesArrString.push(JSON.stringify(_.omit(e, ['__typename'])))
                })

                updateBookData('attachments', attachments)

                // setUploadedImages(imagesArrString)
                updateBookData('attachments', EditBookData().attachments)
                updateBookData('files', EditBookData().files)


                EditBookData(null)
                bookVerification()


            } catch (e) {
                console.log(e)
                Toast('خطا در هنگام ویرایش کتاب')
            }
            EditBookData({})
        } else {
            _categoryComponent(true)
        }

    }, [])

    useEffect(() => {


        if (isBrochure()) {
            updateBookData('isBook', false);
        }


    }, [])


    const submitBook = () => {

        if (uploading) {
            Toast('در حال آپلود فایل یا عکس...')
            // return 0
        }


        if (editing) {

            updateBook({
                variables: {
                    id: BookData.id,
                    title: BookData.title,
                    categoryID: BookData.categoryID,
                    details: BookData.details,
                    isPurchasable: BookData.price ? BookData.price !== 0 : false,
                    isDownloadable: BookData.type === 'pdf',
                    isBook: true,
                    bookFiles: BookData.files,
                    attachments: BookData.attachments,
                    connectWay: connectWay,
                    appearanceID: BookData.appearanceID,
                    pages: BookData.pages,
                    publishedDate: BookData.publishedDate,
                    publisher: BookData.publisher,
                    price: isBookFree ? "0" : BookData.price,
                    writer: BookData.writer,
                    language: BookData.language
                }
            }).then((e) => {
                try {
                    if (e.data.updateBook.status === 'SUCCESS') {
                        lastBookSubmitSuccess(e.data.updateBook.data.id)
                        router.push('/library')
                    } else {
                        Toast('مشکلی در ساخت کتاب به وجود آمده لطفا مجددا تلاش کنید')
                    }
                } catch (e) {
                    console.log(e)
                }
            })
        } else {
            console.log(BookData)

            createBook({
                variables: {
                    title: BookData.title,
                    categoryID: BookData.categoryID,
                    details: BookData.details,
                    isPurchasable: BookData.price ? BookData.price !== 0 : false,
                    isDownloadable: BookData.type === 'pdf',
                    isBook: true,
                    bookFiles: BookData.files,
                    attachments: BookData.attachments,
                    appearanceID: BookData.appearanceID,
                    pages: BookData.pages,
                    publishedDate: BookData.publishedDate,
                    publisher: BookData.publisher,
                    price: isBookFree ? "0" : BookData.price,
                    writer: BookData.writer,
                    language: BookData.language
                }
            }).then((e) => {
                try {
                    console.log(e)

                } catch (e) {
                    console.log(e)

                }
            })
        }


    }
    const removeEmptyProgresses = () => {
        let updateUploadingProgress = [...uploadingProgress];
        updateUploadingProgress.filter(item => {
            return item !== 100 && item !== 0;
        })
        setUploadingProgress(updateUploadingProgress)
    }

    const updateBookData = (param: string | any, value: string | any) => {
        // let updatedBookData = BookData;
        // updatedBookData[`${param}`] = value;
        // setBookData({...updatedBookData});


        setBookData(produce((draft) => {
            //@ts-ignore
            draft[`${param}`] = value;
        }))
    }

    const bookVerification = () => {

        if (currentStep === 0 && BookData.title && BookData.title.length > 2 && BookData.categoryID) {
            return true
        }
        if (currentStep === 1 && BookData.appearance)
            return true
        if (currentStep === 2 && BookData.price) {
            return true
        }

        return false
    }


    return (
        <div ref={mainScroller} className={'pb-20 overflow-scroll h-full'}>
            <ToastContainer/>

            <Dimmer onClose={() => {
                Sdimmer(false)
                SlangDropDown(false)
            }} show={dimmer}/>
            <Header backOnClick={() => {
                console.log(currentStep)
                if (currentStep > 0)
                    ScurrentStep(currentStep - 1)
                else
                    router.push('/library')
                if (mainScroller.current)
                    mainScroller.current.scroll(0, 0)


            }} back={true} title={'افزودن کتاب'}/>

            {
                categoryComponent ?
                    <BookCategories onCatSelected={(category: { id: string, title: string }) => {
                        updateBookData('categoryID', category.id)
                        updateBookData('categoryPersian', category.title)
                        _categoryComponent(false)
                    }}/>
                    :
                    null
            }

            {
                appearanceComponent ?
                    <BookAppearance
                        onAppearanceSelected={(appearance: { id: string, title: string, details: string }) => {
                            _appearanceComponent(false)

                            updateBookData('appearance', appearance.title)
                            updateBookData('appearanceID', appearance.id)
                        }}/>
                    :
                    null
            }

            {
                fileUploadingPercentage && dimmer ?
                    <div

                        className={'fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-50 bg-white  rounded-3xl p-5'}>
                        <CircularProgressBar sqSize={100} strokeWidth={2} percentage={parseInt(fileUploadingPercentage)}
                                             color={'#0095ff'}/>

                        <div className={'absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-primary'}>
                            {fileUploadingPercentage + '%'}
                        </div>
                    </div>
                    :
                    null
            }


            <div
                style={{
                    top: langPosition[0] + 80 + 'px',
                    left: langPosition[1] + 80 + 'px'
                }}
                className={`p-2 shadow overflow-hidden new-book-dropdown fixed  transition-all -translate-x-1/2 -translate-y-1/2  bg-white z-50 flex flex-col justify-center items-center rounded-2xl w-36 ${langDropDown ? 'opacity-100 scale-100 ' : 'opacity-0 scale-0'} `}>
                <Button onClick={() => {
                    let updatedBookData = BookData
                    updatedBookData.language = 'فارسی'
                    setBookData(updatedBookData)
                    Sdimmer(false)
                    SlangDropDown(false)
                }} id={'book-lang-f'} rippleColor={'rgba(0,0,0,0.3)'}
                        className={'w-full h-10 flex flex-col justify-center items-start IranSansMedium pr-3'}>
                    فارسی
                </Button>
                <div className={'new-divider'}/>
                <Button onClick={() => {
                    let updatedBookData = BookData
                    updatedBookData.language = 'انگلیسی'
                    setBookData(updatedBookData)
                    Sdimmer(false)
                    SlangDropDown(false)
                }} id={'book-lang-e'} rippleColor={'rgba(0,0,0,0.3)'}
                        className={'w-full h-10 flex flex-col justify-center items-start IranSansMedium pr-3'}>
                    انگلیسی
                </Button>
            </div>

            <StepperFragment step={currentStep}>
                <Step step={0}>
                    <section className={'bg-white w-full px-3 pb-10'}>

                        <div
                            onClick={() => {
                                _categoryComponent(true)
                            }}
                            className={'flex flex-row pt-5 justify-between items-center text-textDarker IranSansMedium'}>
                            <span>دسته بندی
                                                    <span className={' should-be-filled'}>*</span>

                            </span>
                            <span className={'text-textDark'}>{BookData.categoryPersian ?? "انتخاب دسته بندی"}</span>
                        </div>

                        <div className={'new-divider mt-5'}/>
                        <div className={'IranSansMedium text-textDarker pt-5 should-be-filled'}>نام کتاب

                            <span className={' should-be-filled'}>*</span>
                        </div>

                        <Input id={'input'} numOnly={false} inputClassName={'h-14 mt-5 rounded-xl  '}
                               wrapperClassName={'px-3 h-14'}
                               placeHolder={'کتابِ...'}
                               defaultValue={BookData.title}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                   updateBookData('title', e.currentTarget.value)
                               }}
                        />
                    </section>

                    <div className={'w-full h-10 IranSans text-textDarker text-sm px-3 mt-3 mb-3 '}>
                        لطفا نام روی جلد کتاب یا یک نام دقیق که برای جستجو مناسب باشد را وارد کنید
                    </div>

                    <section className={'bg-white w-full  pb-10'}>
                        <div className={'IranSansMedium text-textDarker pt-5 mx-3'}>نویسنده</div>
                        <Input id={'input'} numOnly={false}
                               inputClassName={' h-14  mt-5 rounded-xl transition-all  '}
                               wrapperClassName={'px-3 mx-3 h-14'}
                               defaultValue={BookData.writer}
                               placeHolder={'کی نوشته کتاب رو ؟'}
                               onClick={(e: any) => {
                                   try {
                                       e.target.parentNode.parentNode.parentNode.parentNode.parentNode.scroll(0, 1000)
                                       console.log(e.target.parentNode.parentNode.parentNode.parentNode.parentNode)

                                   } catch (e) {

                                   }
                               }}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                   updateBookData('writer', e.currentTarget.value)
                               }}
                        />

                        <div className={'new-divider mt-10'}/>

                        <Button id={'lang-select'} rippleColor={'rgba(0,0,0,0.19)'}
                                onClick={() => {
                                    // Sdimmer(true)
                                    SlangDropDown(true)

                                    if (selectLangRef.current) {
                                        let elPosition = selectLangRef.current.getBoundingClientRect()
                                        _langPosition([elPosition.top, elPosition.left])
                                    }
                                }}

                                className={'flex overflow-y-hidden px-3 overflow-x-visible flex-row w-full  pt-5 pb-5 justify-between items-center text-textDarker IranSansMedium'}>
                            <span>زبان <span className={'text-tiny text-textDarker'}>اختیاری</span></span>
                            <span ref={selectLangRef}
                                  className={'text-textDark'}>{!BookData.language ? "انتخاب  کنید" : BookData.language === "فارسی" ? "فارسی" : "انگلیسی"}</span>
                        </Button>
                        <div className={'new-divider '}/>
                        <div className={'IranSansMedium text-textDarker pt-5 mx-3'}>مترجم <span
                            className={'text-textDark text-tiny '}>اختیاری</span></div>
                        <Input id={'input'} numOnly={false} inputClassName={'h-14 mt-5 rounded-xl'}
                               wrapperClassName={'px-6 h-14'}
                               placeHolder={'کی ترجمه کرده ؟'}/>
                    </section>
                    <div className={'w-full h-10 IranSans text-textDarker text-sm px-3 mt-3 mb-3 '}>اگه کتاب ترجمه
                        شده
                        از زبان دیگه ای هست اسم مترجمش رو بهمون بگو
                    </div>
                    <div className={'h-20'}></div>

                </Step>

                <Step step={1}>
                    <div className={'w-full bg-white px-5 pt-3 new-section pb-5 '}>

                        <div className={'flex flex-row justify-between items-center'}>
                            <div className={'flex flex-row items-center justify-start mt-1'}>

                                <span className={'IranSans mr-2'}>عکس کتاب</span>
                            </div>

                            <span
                                className={'text-primary IranSansMedium text-sm'}>{`${BookData.attachments.length}/5`}</span>
                        </div>

                        <div
                            className={'new-photos grid grid-cols-3 grid-rows-2 justify-items-center mt-1 max-w-sm mx-auto'}>
                            {
                                Array(6).fill('').map((photos, index) => {
                                    console.log(BookData)

                                    return <div key={index + 'imageUpload'} className={'contents'}>
                                        <BookImageUpload onImageClick={() => {
                                            alert('nothing happens here yet...')
                                        }} defaultImage={uploadedImages[index]} isFirst={index === 0}
                                                         id={index.toString()}
                                                         onUploadComplete={(e: any) => {
                                                             let backBook = produce(BookData.attachments, (draft: any) => {
                                                                 draft.push(e.data)
                                                             })
                                                             console.log(backBook)
                                                             updateBookData('attachments', backBook)
                                                             setUploadedImages(produce(draft => {
                                                                 draft[index] = DOWNLOAD_HOST() + (e.data.preview ?? e.data.thumbnail)
                                                             }))
                                                             console.log(e)
                                                             setTimeout(() => {
                                                                 console.log(BookData)
                                                             }, 1000)
                                                             console.log(e)
                                                         }} onError={(e: any) => {
                                            console.log(e)
                                        }} bookID={currentBookId.current} setUploading={setUploading}/>
                                    </div>

                                })
                            }

                        </div>
                        <span style={{fontSize: '0.7rem'}}
                              className={'block w-full text-center IranSansMedium text-textDark mt-3'}>در صورت امکان عکس را به صورت عمودی و واضح قرار دهید</span>
                        <div className={'new-divider mt-4'}/>
                        <div
                            onClick={() => {
                                _appearanceComponent(true)
                            }}
                            className={'flex flex-row  pt-5 justify-between items-center text-textDarker IranSansMedium'}>
                            <span>


                                وضعیت ظاهری کتاب

                                                    <span className={' should-be-filled'}>*</span>

                            </span>
                            <span

                                className={'text-textDark'}>{!BookData.appearance ? "انتخاب  کنید" : BookData.appearance}</span>
                        </div>
                        <div className={'new-divider mt-5'}/>

                        <div className={'IranSansMedium text-textDarker pt-5'}>درباره کتاب <span
                            className={'text-tiny text-textDarker'}>اختیاری</span></div>

                        <Input defaultValue={BookData.details} multiLine={true} id={'input'} numOnly={false}
                               inputClassName={'IranSans rounded-xl h-32 mt-5  border-primary border-2 pt-2 px-3 w-full outline-0 '}
                               wrapperClassName={''}
                               placeHolder={'کتابِ...'}
                               onChange={(e: InputEvent) => {
                                   let el = e.currentTarget as HTMLTextAreaElement
                                   updateBookData('details', el.value)
                               }}

                        />
                        <div className={'new-divider mt-3'}/>
                        {/*<div*/}
                        {/*    className={'flex flex-row  pt-5 justify-between items-center text-textDarker IranSansMedium'}>*/}
                        {/*    <span>شهر <span className={'text-tiny text-textDarker'}>اختیاری</span></span>*/}
                        {/*    <span onClick={() => {*/}
                        {/*        // Sdimmer(true)*/}
                        {/*        // SlangDropDown(true)*/}
                        {/*    }}*/}
                        {/*          className={'text-textDark'}>{!BookData.language ? "انتخاب کنید" : BookData.language === "persian" ? "فارسی" : "انگلیسی"}</span>*/}
                        {/*</div>*/}
                        {/*<div className={'new-divider mt-5'}/>*/}
                        {/*<div*/}
                        {/*    className={'flex flex-row  pt-5 justify-between items-center text-textDarker IranSansMedium'}>*/}
                        {/*    <span>دانشگاه <span className={'text-tiny text-textDarker'}>اختیاری</span></span>*/}
                        {/*    <span onClick={() => {*/}
                        {/*        // Sdimmer(true)*/}
                        {/*        // SlangDropDown(true)*/}
                        {/*    }}*/}
                        {/*          className={'text-textDark'}>{!BookData.language ? "انتخاب کنید" : BookData.language === "persian" ? "فارسی" : "انگلیسی"}</span>*/}
                        {/*</div>*/}
                        {/*<div className={'new-divider mt-5'}/>*/}

                        <div className={'IranSansMedium text-textDarker pt-3'}>ناشر - نوبت چاپ <span
                            className={'text-tiny text-textDarker'}>اختیاری</span></div>

                        <div className={'w-full grid grid-cols-7 grid-rows-1 gap-2 mt-3'}>
                            <Input id={'author'} numOnly={false} wrapperClassName={'col-span-5 h-12'}
                                   placeHolder={'اسم انتشارات'}
                                   inputClassName={"rounded-xl"}
                                   defaultValue={BookData.publisher}
                                   onChange={(e: InputEvent) => {
                                       let el = e.currentTarget as HTMLTextAreaElement
                                       updateBookData('publisher', el.value)
                                   }}
                            />

                            <Input id={'author'} numOnly={true} maxLength={4}
                                   inputClassName={'center-placeholder rounded-xl px-3 text-center'}
                                   defaultValue={BookData.publishedDate}
                                   wrapperClassName={'col-span-2 h-12'} placeHolder={'سال'}
                                   onChange={(e: InputEvent) => {
                                       let el = e.currentTarget as HTMLTextAreaElement
                                       updateBookData('publishedDate', parseInt(el.value))
                                   }}
                            />
                        </div>
                    </div>
                    <div className={'w-full h-10 IranSans text-textDarker text-sm px-3 mt-3 mb-3 '}>

                        برا خیلی ها مهمه که کتاب مال چه سالیه و انتشاراتش چیه
                        <br/>
                        اختیاریه ولی بنویسی بهتره
                    </div>
                    <div className={'h-32'}/>

                </Step>
                <Step step={2}>
                    <section className={'bg-white w-full px-3 pb-5'}>
                        <div className={'IranSansMedium text-textDarker pt-5'}>نوع کتاب</div>


                        <div
                            className={'bg-background w-4/5 mx-auto p-0 pt-1 flex flex-row mt-3 items-center justify-between overflow-hidden rounded-lg relative  border-primary h-12'}>
                            <div
                                className={`absolute w-1/2  top-0 h-full bg-primary transition-all ease-in-out ${BookData.type === 'physical' ? 'left-0' : 'left-1/2'}`}></div>
                            <div
                                className={`IranSansMedium relative transition-all h-full leading-9 ${BookData.type === 'pdf' ? 'text-white' : 'text-black'} z-10 w-full text-center`}
                                onClick={() => {
                                    updateBookData('type', 'pdf')
                                }}>
                                <div
                                    className={'block relative mx-auto overflow-hidden flex flex-col justify-center items-center'}>
                                    <div>
                                        کتابِ دیـجیتـال
                                        <span className={'text-tiny inline-block -translate-y-2 '}>
                PDF
                </span>
                                    </div>

                                </div>
                            </div>
                            <div
                                className={`IranSansMedium transition-all h-full leading-9 ${BookData.type === 'physical' ? 'text-white' : 'text-black'} z-10 w-full text-center`}
                                onClick={() => {
                                    updateBookData('type', 'physical')
                                }}>کتابِ فیـزیکـی
                            </div>
                        </div>

                    </section>
                    <div className={'w-full h-10 IranSans text-textDarker text-sm px-3 mt-3 mb-3 '}>
                        تو یونیـمـون میتونین کتاب رو به صورت دیجیتال یا به صورت فیزیکی قرار بدین
                    </div>


                    <section
                        className={`bg-white w-full transition-all  ${BookData.type !== 'pdf' ? 'h-0 overflow-hidden ' : 'px-3  pt-5 pb-5'} `}>
                        <div
                            className={'new-file  flex flex-col justify-center items-center max-w-sm border-2 border-dashed  rounded-2xl mx-auto px-4 relative'}>
                            <input type={"file"}
                                   className={`absolute w-full h-full top-0 left-0 opacity-0 z-10 ${bookUploadState === "uploaded" ? 'pointer-events-none' : ''}`}
                                   onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                       // if (e && e.currentTarget && e.currentTarget.files)
                                       //     uploadFile(e.currentTarget.files[0])


                                       if (e.currentTarget.files && e.currentTarget.files[0]) {

                                           let fileName = e.currentTarget.files[0].name
                                           let fileSize = e.currentTarget.files[0].size

                                           fileSize = parseFloat((fileSize / 1000000).toFixed(2))

                                           setFileSize(fileSize)
                                           setFileName(fileName)
                                           setBookUploadState('uploading')


                                           uploadBookFile(e.currentTarget.files[0], removeEmptyProgresses, currentBookId.current, (response: any) => {
                                                   _fileUploadingPercentage('0')
                                                   if (response.data.validMimes) {
                                                       Toast("فرمت فایل معتبر نیست")
                                                   } else if (response.data !== 500 && response.data !== 401 && response.data !== 400) {
                                                       let files = [];
                                                       files = BookData.files

                                                       files.push({
                                                           url: response.data.url as never,
                                                           type: 'pdf' as never,
                                                           mime: 'pdf' as never,
                                                       } as never)
                                                       let fileNames = []
                                                       fileNames.push(fileName)
                                                       updateBookData('files', [...files])
                                                       updateBookData('fileNames', [...fileNames])
                                                       removeEmptyProgresses()
                                                       setBookUploadState('uploaded')

                                                   } else {
                                                       Toast('خطا در آپلود فایل، دوباره تلاش کنید')
                                                       setBookUploadState('')

                                                   }
                                               }, (error: any) => {
                                                   Sdimmer(false)
                                                   setBookUploadState('')
                                               },
                                               (progressEvent: any) => {
                                                   let percentCompleted = Math.round(
                                                       (progressEvent.loaded * 100) / progressEvent.total
                                                   );
                                                   _fileUploadingPercentage(percentCompleted as any)
                                               }
                                           )
                                       }

                                       // e.currentTarget.value = '';


                                   }}/>

                            <div className={'file w-full flex flex-row justify-between items-center my-3'}>
                                <div className={'file-right flex flex-row justify-center items-center'}>
                                    <div dir={'ltr'} className={'h-10 w-10 m-0 overflow-hidden'}>
                                        {!bookUploadState ?
                                            <EmptyFileSVG/>
                                            :
                                            <FileSVG/>
                                        }
                                    </div>
                                    <div
                                        className={'IranSansMedium mr-4 opacity-60 whitespace-nowrap '} style={{
                                        width: '100px ',
                                        textOverflow: `${bookUploadState ? 'ellipsis' : ''}`,
                                        overflow: `${bookUploadState ? 'hidden' : ''}`
                                    }}>{!bookUploadState ? ' افزودن فایل کتاب' : fileName}</div>
                                </div>
                                <div id={'file-upload-state-holder'}
                                     className={'flex flex-row  justify-center items-center'}>
                                    {
                                        bookUploadState ?

                                            bookUploadState === "uploading" ?
                                                <div
                                                    className={'flex flex-row-reverse justify-center items-center'}>
                                                    <div
                                                        className={"relative flex flex-col justify-center items-center mr-3"}>
                                                        <CircularProgressBar sqSize={30} strokeWidth={3}
                                                                             percentage={parseInt(fileUploadingPercentage)}
                                                                             color={'#1DA1F2'}/>

                                                        <span
                                                            className={'block text-textDarker absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 IranSansMedium scale-90'}>{fileUploadingPercentage}</span>
                                                    </div>
                                                    {
                                                        parseInt(fileUploadingPercentage) ?
                                                            <span dir={'ltr'}
                                                                  className={'IranSansMedium text-sm'}>{`${(fileSize * parseInt(fileUploadingPercentage) / 100).toFixed(2)} MB / ${fileSize} MB`}</span> :
                                                            <span dir={'ltr'}
                                                                  className={'IranSansMedium text-sm'}>{`0MB / ${fileSize} MB`}</span>

                                                    }
                                                </div>

                                                :
                                                bookUploadState === 'uploaded' ?
                                                    <div
                                                        className={'flex flex-row-reverse justify-center items-center'}>

                                                        <div onClick={() => {
                                                            updateBookData('files', [])
                                                            updateBookData('fileNames', [])
                                                            setBookUploadState('')

                                                        }} className={'w-8 h-8 mr-2 p-1 bg-background rounded'}>
                                                            <Trash/>
                                                        </div>


                                                        <span dir={'ltr'}
                                                              className={'IranSansMedium text-sm'}>{`${fileSize} MB`}</span>


                                                    </div>
                                                    :

                                                    null
                                            :
                                            <div dir={'ltr'} className={'IranSans w-7 h-7  '}><FileUploadSVG/></div>

                                    }

                                </div>
                            </div>
                        </div>

                        {/*{*/}
                        {/*    BookData.fileNames.map((file: { name: string }) => {*/}

                        {/*        return (*/}
                        {/*            <div key={file.name}*/}
                        {/*                 className={'new-file mt-4 flex flex-col justify-center items-center max-w-sm border-2 border-dashed  rounded-2xl mx-auto px-4 relative'}>*/}
                        {/*                <div*/}
                        {/*                    className={'file w-full flex flex-row justify-between items-center my-3'}>*/}
                        {/*                    <div className={'file-right flex flex-row justify-center items-center'}>*/}
                        {/*                        <div dir={'ltr'} className={'h-10 w-10 m-0 overflow-hidden'}>*/}
                        {/*                            <FileSVG/>*/}
                        {/*                        </div>*/}
                        {/*                        <div className={'IranSansMedium w-24 mr-4 opacity-60 overflow-hidden'}>*/}

                        {/*                            <span*/}
                        {/*                                className={'block w-full ml-0  whitespace-nowrap overflow-hidden'}>*/}
                        {/*                        {file.name}*/}

                        {/*                            </span>*/}

                        {/*                        </div>*/}
                        {/*                    </div>*/}
                        {/*                    <div dir={'ltr'} className={'IranSans w-7 h-7 '}><DownloadFileSVG/></div>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}


                        {/*            // <a href={DOWNLOAD_HOST + '/' + file.url} rel={'noreferrer'}*/}
                        {/*            //    target={'_blank'} key={file.url} className={'block w-full flex flex-row-reverse justify-center border border-gray-300 max-w-sm rounded-2xl  items-center mt-4 mx-auto'}>*/}
                        {/*            //     <div*/}
                        {/*            //         className={'file w-full flex flex-col justify-between items-center my-3'}>*/}
                        {/*            //         <div*/}
                        {/*            //             className={'file-right  w-96 flex flex-row justify-center items-center'}>*/}
                        {/*            //             <div dir={'ltr'}*/}
                        {/*            //                  className={'h-10 w-10 m-0 overflow-hidden'}>*/}
                        {/*            //                 <FileSVG/></div>*/}
                        {/*            //             <div*/}
                        {/*            //                 className={'IranSansMedium mr-2 w-20 overflow-hidden'}>{file.name}</div>*/}
                        {/*            //             <div dir={'ltr'}*/}
                        {/*            //                  className={'download-holder w-4 h-4 mr-2'}>*/}
                        {/*            //                 <DownloadFileSVG/>*/}
                        {/*            //             </div>*/}
                        {/*            //         </div>*/}
                        {/*            //         /!*<div dir={'ltr'} className={'IranSans'}>{"12.5 MB"}</div>*!/*/}
                        {/*            //     </div>*/}
                        {/*            //*/}
                        {/*            //*/}
                        {/*            // </a>*/}
                        {/*        )*/}

                        {/*    })*/}
                        {/*}*/}

                    </section>

                    <div
                        className={`w-full  IranSans text-textDarker text-sm  ${BookData.type !== 'pdf' ? 'h-0 hidden overflow-hidden ' : 'px-3 mt-3 mb-3'} `}>
                        محدودیت آپلود برای کتاب ها 500 مگابایت است
                    </div>

                    <section className={'bg-white w-full px-3 pt-3 pb-3 '}>
                        <div className={'flex flex-row justify-between items-center'}>
                            <span className={'IranSansMedium'}>تعداد صفحه</span>
                            <Input id={'page-count'} numOnly={true} maxLength={5} wrapperClassName={'w-20 h-10'}
                                   inputClassName={'center-placeholder IranSans text-center rounded-xl'}
                                   placeHolder={'تعداد'}
                                   onChange={(e: InputEvent) => {
                                       let el = e.currentTarget as HTMLTextAreaElement
                                       updateBookData('pages', parseInt(el.value))
                                   }}
                            />
                        </div>
                        <div className={'new-divider mt-3'}></div>


                        <div className={'flex flex-row justify-between items-center mt-3'}>
                            <span className={'IranSansMedium'}>فروش به قیمت</span>
                            <div
                                className={' IranSansMedium h-10 w-24 px-2 flex flex-row justify-around items-center bg-background rounded-lg'}>
                                <input id={'free-book'}
                                       className={'free-checkbox h-5 w-5 rounded border-2 border-primary'}
                                       type={'checkbox'}
                                    // defaultValue={BookData.price}
                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => {

                                           if (e.currentTarget.checked) {
                                               if (priceInputRef.current)
                                                   (priceInputRef.current as HTMLInputElement).value = "0"
                                               //todo this state just added
                                               setIsBookFree(true)


                                           } else if (priceInputRef.current) {
                                               setIsBookFree(false);
                                               (priceInputRef.current as HTMLInputElement).value = (BookData.price.toString() ?? "").split('').reverse().join('').replace(/,/g, '').replace(/(\d{3}(?!$))/g, "$1,").split('').reverse().join('').replace(/[^\d,]/g, '')

                                           }
                                       }}/>
                                <label htmlFor={'free-book'}> رایگان</label>
                            </div>
                        </div>

                        <div
                            className={`${isBookFree ? 'opacity-70 grayscale pointer-events-none' : ''} border-primary border-2 w-11/12 mx-auto h-14  rounded-xl mt-5 flex flex-row-reverse justify-start items-center`}>
                            <div className={'w-10 h-10 mx-2 p-2'}>
                                <Toman/>
                            </div>
                            {/*todo theres a bug when user wants to edit its always 20000*/}

                            <div className={'h-3/5 bg-gray-400 w-0 border'}/>
                            <Input inputRef={priceInputRef} id={'book-price'} dir={'ltr'}
                                   defaultValue={fixPrice(BookData.price) ?? '20,000'}
                                   numOnly={false}

                                   inputClassName={'border-0 border-transparent text-left text-lg IranSansBold rounded-xl'}
                                   wrapperClassName={'w-full h-full '}
                                   onChange={(e: InputEvent) => {
                                       let el = e.currentTarget as HTMLInputElement
                                       updateBookData('price', parseInt(el.value.replace(',', '')))
                                       el.value = el.value.split('').reverse().join('').replace(/,/g, '').replace(/(\d{3}(?!$))/g, "$1,").split('').reverse().join('').replace(/[^\d,]/g, '')
                                       if (lastPrice.current)
                                           lastPrice.current = el.value.toString()
                                   }}
                            />
                        </div>
                    </section>

                    <div className={'w-full h-40 bg-white mt-4 px-4 pt-3 new-section'}>

                        <span className={'text-textBlack text-md IranSansMedium  '}>اطلاعات تماس
                                                <span className={' should-be-filled'}>*</span>

                        </span>
                        <div className={'w-full flex items-center justify-center relative mt-4'}>
                            <div
                                className={`absolute  left-6 top-1/2 -translate-y-1/2 flex flex-col justify-center items-center w-8 h-8`}>

                                <div
                                    className={`w-full relative  h-full bg-background rounded-md p-2 flex flex-col justify-center items-center `}>
                                    <div
                                        className={`w-5 absolute flex flex-col justify-center items-center h-5 ${contactType === 'telegram' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300`}>
                                        <TelInputSVG/>
                                    </div>
                                    <div
                                        className={`w-5 absolute flex flex-col justify-center items-center h-5 ${contactType === 'phone' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300`}>
                                        <BoldMobile/>
                                    </div>
                                    <div
                                        className={`w-5 absolute flex flex-col justify-center items-center h-5 ${contactType === '' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300`}>
                                        <RightSquareSVG/>
                                    </div>
                                </div>


                            </div>
                            <Input dir={'ltr'} placeHolder={''}
                                   inputClassName={'text-left pl-12 rounded-xl border-2'} maxLength={30}
                                   id={'title'} numOnly={false}
                                   defaultValue={connectWay}
                                   wrapperClassName={'w-11/12 h-14 '}
                                   onChange={(e: any) => {
                                       if (e.currentTarget.value.length > 0) {
                                           if (contactType === 'phone') {
                                               e.currentTarget.value = e.currentTarget.value.replaceAll(/[^0-9]/g, '')
                                           }
                                           if (/[^0-9]/.test(e.currentTarget.value)) {
                                               setContactType('telegram')
                                               e.currentTarget.value = '@' + e.currentTarget.value.replaceAll(/[^a-zA-z0-9]/g, '')
                                               // e.currentTarget.value =  e.currentTarget.value.replaceAll(/[^0-9]/g, '')

                                           } else {
                                               setContactType('phone')
                                           }
                                       } else
                                           setContactType('')
                                       setContactAddress(e.currentTarget.value)

                                       setConnectWay(e.currentTarget.value)
                                   }}

                                   labelText={'شماره تلفن یا آیدی تلگرام'}/>
                        </div>

                    </div>


                    <div className={'h-32'}></div>
                </Step>

            </StepperFragment>

            <div className={'w-full bottom-2 fixed flex flex-row items-center justify-center po'}>
                <Button

                    onClick={() => {
                        if (mainScroller.current)
                            mainScroller.current.scroll(0, 0)

                        if (currentStep === 2) {
                            submitBook()
                        } else {
                            ScurrentStep(currentStep + 1)
                            setTimeout(() => {
                                if (mainScroller.current)
                                    mainScroller.current.scroll(0, 0)
                            }, 20);

                        }
                    }}
                    disabled={!bookVerification()}
                    id={'new-appeal-submit'}
                    loading={createBookResult.loading || updateBookResult.loading}
                    className={`w-11/12 h-14 ${bookVerification() ? 'bg-primary' : 'bg-gray-400'}  transition-all duration-300  rounded-xl flex flex-row justify-between items-center px-4`}
                    rippleColor={'rgba(255,255,255,0.49)'}
                >
                    <div className={'text-white IranSans w-8 '}/>
                    <div className={'text-white IranSans  '}>{`${currentStep == 2 ? 'ثبت' : 'بعدی'}`}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25"
                         opacity={currentStep == 2 ? 0 : 1}>
                        <g id="arrow-left" transform="translate(-363.5 -251.5)">
                            <g id="Vector" transform="translate(371.155 255.333)" fill="#fff">
                                <path
                                    d="M 7.84499979019165 17.58749961853027 C 7.578320026397705 17.58749961853027 7.327309608459473 17.48336029052734 7.138219833374023 17.29427909851074 L 0.618219792842865 10.77427959442139 C -0.5434601902961731 9.61259937286377 -0.5434601902961731 7.722399711608887 0.618219792842865 6.56071949005127 L 7.138219833374023 0.04071969538927078 C 7.325699806213379 -0.1467503011226654 7.576699733734131 -0.2500002980232239 7.84499979019165 -0.2500002980232239 C 8.113299369812012 -0.2500002980232239 8.364299774169922 -0.1467503011226654 8.551779747009277 0.04071969538927078 C 8.941490173339844 0.430439680814743 8.941490173339844 1.064559698104858 8.551779747009277 1.454279661178589 L 2.031779766082764 7.974279880523682 C 1.649529814720154 8.35651969909668 1.649529814720154 8.978479385375977 2.031779766082764 9.360719680786133 L 8.551779747009277 15.8807201385498 C 8.941490173339844 16.27043914794922 8.941490173339844 16.90456008911133 8.551779747009277 17.29427909851074 L 8.54872989654541 17.29731941223145 L 8.54557991027832 17.30026054382324 C 8.34712028503418 17.48548889160156 8.098320007324219 17.58749961853027 7.84499979019165 17.58749961853027 Z"
                                    stroke="none"/>
                                <path
                                    d="M 7.84499979019165 17.33749961853027 C 8.034999847412109 17.33749961853027 8.22499942779541 17.25749969482422 8.375 17.11750030517578 C 8.664999961853027 16.82749938964844 8.664999961853027 16.34749984741211 8.375 16.05749893188477 L 1.854999780654907 9.53749942779541 C 1.374999761581421 9.057499885559082 1.374999761581421 8.277500152587891 1.854999780654907 7.797499656677246 L 8.375 1.277499675750732 C 8.664999961853027 0.9874997138977051 8.664999961853027 0.5074996948242188 8.375 0.2174996882677078 C 8.08499813079834 -0.07250067591667175 7.604999542236328 -0.07249993830919266 7.314999580383301 0.2174996882677078 L 0.7949998378753662 6.737499713897705 C -0.265000194311142 7.797499656677246 -0.265000194311142 9.53749942779541 0.7949998378753662 10.59749984741211 L 7.314999580383301 17.11750030517578 C 7.464999675750732 17.26749992370605 7.654999732971191 17.33749961853027 7.84499979019165 17.33749961853027 M 7.84499979019165 17.83749961853027 C 7.511539936065674 17.83749961853027 7.197749614715576 17.70735931396484 6.96144962310791 17.47105026245117 L 0.4414498209953308 10.9510498046875 C -0.8177101612091064 9.691899299621582 -0.8177101612091064 7.643099784851074 0.4414498209953308 6.383949756622314 L 6.96144962310791 -0.1360502988100052 C 7.196139812469482 -0.3707503080368042 7.509929656982422 -0.5000002980232239 7.84499979019165 -0.5000002980232239 C 8.180069923400879 -0.5000002980232239 8.493860244750977 -0.3707503080368042 8.728549957275391 -0.1360502988100052 C 9.215749740600586 0.3511396944522858 9.215749740600586 1.14385974407196 8.728549957275391 1.631049752235413 L 2.208549737930298 8.151049613952637 C 1.923779845237732 8.435819625854492 1.923779845237732 8.899179458618164 2.208549737930298 9.18394947052002 L 8.728549957275391 15.70394992828369 C 9.215749740600586 16.19113922119141 9.215749740600586 16.98386001586914 8.728549957275391 17.47105026245117 L 8.716159820556641 17.48303031921387 C 8.471249580383301 17.71160888671875 8.161859512329102 17.83749961853027 7.84499979019165 17.83749961853027 Z"
                                    stroke="none" fill="#fff"/>
                            </g>
                            <g id="Vector-2" data-name="Vector" transform="translate(364 252)" fill="none"
                               opacity="0">
                                <path d="M0,0H24V24H0Z" stroke="none"/>
                                <path
                                    d="M 0 0 L 0 24 L 24 24 L 24 0 L 0 0 M -0.5 -0.5 L 24.5 -0.5 L 24.5 24.5 L -0.5 24.5 L -0.5 -0.5 Z"
                                    stroke="none" fill="#fff"/>
                            </g>
                        </g>
                    </svg>
                </Button>
            </div>

        </div>
    )

        ;
}

export default NewBook;