import { Country } from '../geography/entities/countries.entity'
import { Locality } from '../geography/entities/localities.entity'
import { PanCountry } from '../geography/entities/pancountries.entity'
import { Region } from '../geography/entities/regions.entity'
import { State } from '../geography/entities/state.entity'

export class Geography {
  countries: Country[]
  panCountries: PanCountry[]
  regions: Region[]
  state: State[]
  localities: Locality[]
}
