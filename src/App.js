import './styles/main.scss'
import { useDebounce } from './utilities';
import React, {useEffect, useState} from 'react';
import axios from 'axios';

function App() {
  const [searchTerm, setSearchTerm ] = useState('')
  const [sort, setSort ] = useState('relevance')
  const [results, setResults] = useState([])
  const [beginDate, setBeginDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [dateMenuExpanded, setDateMenuExpanded] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)


  const removeDateDashes = (dateString) => {
    let year  = dateString.slice(0,4)
    let month = dateString.slice(5,7)
    let day = dateString.slice(8,10)
    return year+month+day
  }

  const parseDate = (dateString) => {
    let month = ``
    let year  = dateString.slice(0,4)
    let monthString = dateString.slice(5,7)

    if(monthString===`01`) month = `Jan. `
    else if(monthString===`02`) month = `Feb. `
    else if(monthString===`03`) month = `Mar. `
    else if(monthString===`04`) month = `Apr. `
    else if(monthString===`05`) month = `May `
    else if(monthString===`06`) month = `Jun. `
    else if(monthString===`07`) month = `Jul. `
    else if(monthString===`08`) month = `Aug. `
    else if(monthString===`09`) month = `Sept. `
    else if(monthString===`10`) month = `Oct. `
    else if(monthString===`11`) month = `Nov. `
    else if(monthString===`12`) month = `Dec. `
    else month = ``

    let day = dateString.slice(8,10)
    if (day[0] === `0`) day = day.substring(1,3)
    day = day+ `, `

    return month+day+year
  }


  const getArticles = async (termInput) => {
    if(termInput){

      const data = {
        q: termInput,
        'api-key': process.env.REACT_APP_API_KEY,
        begin_date: null,
        end_date: null,
        sort: sort,
      }

      if(beginDate) data.begin_date = removeDateDashes(beginDate)
      if(endDate) data.end_date = removeDateDashes(endDate)

      console.log(data)
  
      try {
        const response = await axios.get(process.env.REACT_APP_BASE_URL, { params: data })
        setResults(response.data.response.docs)
      } catch (err) {
        console.log(err.message, err.code)
      }
    }
  }

  useEffect(() => {
    if(debouncedSearchTerm){
      getArticles(debouncedSearchTerm)
    } else{
      setResults([])
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    getArticles(debouncedSearchTerm)
  }, [sort, beginDate, endDate])


  return (
		<main className="display-grid">
			<a className="site-heading" href="https://www.nytimes.com/" target="_blank">The New York Times</a>
			<h2 className="site-heading__subheading">Article Finder</h2>
			<section className="search-controls">
				<p className="article-count"></p>
        <input className="search-controls__input search-controls__input_term" id="term" name="term" type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

				<div className="search-menu">
          <select name="sort" className="search-menu__sort-list" id="sort" onChange={(e) => setSort(e.target.value)}>
            <option className="search-menu__item search-menu__item_relevance" value="best_match">Sort by Relevance</option>
            <option className="search-menu__item search-menu__item_newest" value="newest">Sort by Newest</option>
            <option className="search-menu__item search-menu__item_oldesy" value="oldest">Sort by Oldest</option>
          </select>
				</div>

				<div className="date-range"><span className="date-range__toggle" onClick={() => setDateMenuExpanded(!dateMenuExpanded)}>Date Range <span className="date-range__symbol">{dateMenuExpanded ? "< >" : "><"}</span></span>
					<div className={dateMenuExpanded ? "date-range__input" : "date-range__input hidden"}>
            <input className="date-range__input-field date-range__input-field_begin" id="begin-date" name="begin-date" type="date" onChange={(e) => setBeginDate(e.target.value)}/>
              <p className="date-range__separator">to</p>
            <input className="date-range__input-field date-range__input-field_end" id="end-date" name="end-date" type="date" onChange={(e) => setEndDate(e.target.value)}/>
					</div>
				</div>
			</section>
			<section className="results">
        {results.map((result, i) => {
          const key = `result--${i}`
          const imageSource = result.multimedia[0] ? `https://www.nytimes.com/${result.multimedia[0].url}` : null
          const date = parseDate(result.pub_date)

          return(
            <div key={key} className="results__row">
              <p className="results__date">{date}</p>
              <h3 className="results__section">{result.section_name}</h3>
              <a href={result.web_url} target="_blank" className="results__title">{result.headline.main}</a>
              <p className="results__abstract">{result.abstract} </p>
              <p className="results__byline">{result.byline.original}</p>
              <a className="results__image-slot" href={result.web_url}>{imageSource ? <img src={imageSource} className="results__photo" alt="article image" loading="lazy" /> : null }</a>
            </div>
          )

        })}






			</section>
		</main>
  );
}

export default App;
