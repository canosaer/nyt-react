import './styles/main.scss'
import { useDebounce } from './utilities';
import React, {useEffect, useState} from 'react';
import axios from 'axios';

function App() {
  const [searchTerm, setSearchTerm ] = useState('')
  const [location, setLocation ] = useState('')
  const [sort, setSort ] = useState('best_match')
  const [radius, setRadius ] = useState('25')
  const [results, setResults] = useState([])
  const [openNow, setOpenNow] = useState(false)
  const [priceArray, setPriceArray] = useState([])
  const [priceString, setPriceString] = useState('1, 2, 3, 4')
  const [priceMenuExpanded, setPriceMenuExpanded] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const debouncedLocation = useDebounce(location, 500)

  const updatePriceFilters = (e) => {
    let updatedPriceArray = priceArray
    const selectedBox = e.target.name
    
    if(updatedPriceArray.includes(selectedBox)){
      updatedPriceArray = priceArray.filter(box => box != selectedBox)
    }
    else{
      updatedPriceArray = [...priceArray, selectedBox]
    }
    setPriceArray(updatedPriceArray)

    let updatedPriceString = ''
    if(updatedPriceArray.includes('$')) updatedPriceString = updatedPriceString + '1, '
    if(updatedPriceArray.includes('$$')) updatedPriceString = updatedPriceString + '2, '
    if(updatedPriceArray.includes('$$$')) updatedPriceString = updatedPriceString + '3, '
    if(updatedPriceArray.includes('$$$$')) updatedPriceString = updatedPriceString + '4, '
    if(!updatedPriceString) updatedPriceString = '1, 2, 3, 4, '

    updatedPriceString = updatedPriceString.slice(0, updatedPriceString.length-2)

    setPriceString(updatedPriceString)
  }


  const getBusinesses = async (termInput, locationInput) => {
    if(termInput){
      const searchLocation = locationInput ? locationInput : "Atlanta, GA"

      const distance = parseInt(radius.substring(0,2).trim()) * 800
  
      const data = {
        _ep: `/businesses/search`,
        term: termInput,
        location: searchLocation,
        sort_by: sort,
        radius: distance,
        open_now: openNow,
        price: priceString,
      }
  
      const headers = {
        Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`
      }
  
      try {
        const response = await axios.get(process.env.REACT_APP_BASE_URL, { params: data, headers: headers })
        setResults(response.data.businesses)
      } catch (err) {
        console.log(err.message, err.code)
      }
    }
  }

  useEffect(() => {
    if(debouncedSearchTerm || debouncedLocation){
      getBusinesses(debouncedSearchTerm, debouncedLocation)
    } else{
      setResults([])
    }
  }, [debouncedSearchTerm, debouncedLocation])

  useEffect(() => {
    getBusinesses(debouncedSearchTerm, debouncedLocation)
  }, [openNow, priceString, radius, sort])


  return (
		<main className="display-grid">
			<a className="site-heading" href="https://www.yelp.com/" target="_blank">Yelp</a>
			<h2 className="site-heading__subheading">Business Search</h2>
			<section className="search-controls">
				<p className="article-count"></p>
        <input className="search-controls__input search-controls__input_term" id="term" name="term" placeholder="business" type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input className="search-controls__input search-controls__input_location" id="location" name="location" placeholder="location" type="text" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

				<div className="search-menu">
          <select name="sort" className="search-menu__sort-list" id="sort" onChange={(e) => setSort(e.target.value)}>
            <option className="search-menu__item search-menu__item_relevance" value="best_match">Sort by Relevance</option>
            <option className="search-menu__item search-menu__item_rating" value="rating">Sort by Rating</option>
            <option className="search-menu__item search-menu__item_count" value="review_count">Sort by # Reviews</option>
            <option className="search-menu__item search-menu__item_distance" value="distance">Sort by Distance</option>
          </select>
				</div>

				<div className="price-range"><span className="price-range__toggle" onClick={() => setPriceMenuExpanded(!priceMenuExpanded)}>Price Range <span className="price-range__symbol">{priceMenuExpanded ? "<>" : "><"}</span></span>
					<div className={priceMenuExpanded ? "price-range__input" : "price-range__input hidden"}>
						<input className="price-range__checkbox" id="$" name="$" type="checkbox" onClick={(e) => updatePriceFilters(e)} />
						<label className="price-range__label">$</label>
						<input className="price-range__checkbox" id="$$" name="$$" type="checkbox" onClick={(e) => updatePriceFilters(e)} />
						<label className="price-range__label">$$</label>
						<input className="price-range__checkbox" id="$$$" name="$$$" type="checkbox" onClick={(e) => updatePriceFilters(e)} />
						<label className="price-range__label">$$$</label>
						<input className="price-range__checkbox" id="$$$$" name="$$$$" type="checkbox" onClick={(e) => updatePriceFilters(e)} />
						<label className="price-range__label">$$$$</label>
					</div>
				</div>
        <div className="radius-menu">
          <p className="radius-menu__within">Within</p>
          <select name="sort" className="radius-menu__list" id="radius" defaultValue="25" onChange={(e) => setRadius(e.target.value)}>
            <option className="radius-menu__item radius-menu__item_5" value="5">5 miles</option>
						<option className="radius-menu__item radius-menu__item_15" value="15">15 miles</option>
						<option className="radius-menu__item radius-menu__item_25" value="25">25 miles</option>
						<option className="radius-menu__item radius-menu__item_50" value="50">50 miles</option>
          </select>
				</div>
				<div className="open-now">
					<label className="open-now__label">Open Now</label>
					<input className="open-now__checkbox" id="open" name="open" type="checkbox" onClick={() => setOpenNow(!openNow)}/>
				</div>
			</section>
			<section className="results">
        {results.map((result, i) => {
          const key = `result--${i}`
          const imageSource = result.image_url

          let transactions = ''
          if(result.transactions[0]){
            transactions = ' • '
            for(let i=0;i<result.transactions.length;i++){
              let newTransaction = result.transactions[i].replace(/^\w/, (c) => c.toUpperCase())
              transactions = transactions + newTransaction
              if(result.transactions[i+1]) transactions = transactions + ', '
            }
          }

          let categories = ''
          for(let i=0;i<result.categories.length;i++){
            categories = categories + result.categories[i].title
            if(result.categories[i+1]) categories = categories + ', '
          }

          return(
            <div className="results__row" key={key}>
              <a className="results__image-slot" href={result.url} target="_blank"><img className="results__photo" src={imageSource} alt="business image" loading="lazy" /></a>
              <a href={result.url} target="_blank" className="results__name">{result.name}</a>
              <div className="results__rating-row"><span className="results__rating">{result.rating} stars</span><span className="results__reviews"> ({result.review_count} reviews)</span></div>
              <div className="results__info-row"><span className="results__price">{result.price} • {categories}</span><span className="results__category">{transactions}</span></div>
              <p className="results__address-row">{result.location.address1}</p>
              {result.location.address2 ? <p className="results__address-row">{result.location.address2}</p> : null}
              {result.location.address3 ? <p className="results__address-row">{result.location.address3}</p> : null}
              <p className="results__address-row">{result.location.city}, {result.location.state} {result.location.zip_code}</p>


            </div>
          )

        })}






			</section>
		</main>
  );
}

export default App;
