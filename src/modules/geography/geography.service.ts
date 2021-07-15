import { build } from '@hapi/joi'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EventListenerTypes } from 'typeorm/metadata/types/EventListenerTypes'

import { Article } from '../article/article.entity'
import { Geography } from '../dto/geography.dto'
import { Country } from './entities/countries.entity'
import { Locality } from './entities/localities.entity'
import { PanCountry } from './entities/pancountries.entity'
import { Region } from './entities/regions.entity'
import { State } from './entities/state.entity'

@Injectable()
export class GeographyService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(PanCountry)
    private readonly panCountryRepository: Repository<PanCountry>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Locality)
    private readonly localityRepository: Repository<Locality>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>
  ) {}

  async saveGeography(geography: Geography, article?: Article): Promise<void> {
    let countries = []
    let panCountries = []
    let states = []
    let regions = []
    let localities = []

    for (const country of geography.countries) {
      let existingCounty

      if (country) {
        existingCounty = await this.countryRepository.findOne(country)
      }

      if (!existingCounty) {
        existingCounty = await this.countryRepository.save(country)
      }

      countries.push(existingCounty)
    }

    for (const panCountry of geography.panCountries) {
      let existingPanCounty
      if (panCountry) {
        existingPanCounty = await this.panCountryRepository.findOne(panCountry)
      }

      if (!existingPanCounty) {
        existingPanCounty = await this.panCountryRepository.save(panCountry)
      }

      panCountries.push(existingPanCounty)
    }

    for (const state of geography.state) {
      let existingState
      if (state) {
        existingState = await this.stateRepository.findOne(state)
      }

      if (!existingState) {
        existingState = await this.stateRepository.save(state)
      }

      states.push(existingState)
    }

    for (const region of geography.regions) {
      let existingRegion
      if (region) {
        existingRegion = await this.regionRepository.findOne(region)
      }

      if (!existingRegion) {
        existingRegion = await this.regionRepository.save(region)
      }

      regions.push(existingRegion)
    }

    for (const locality of geography.localities) {
      let existingLocatity
      if (locality) {
        existingLocatity = await this.localityRepository.findOne(locality)
      }

      if (!existingLocatity) {
        existingLocatity = await this.localityRepository.save(locality)
      }

      localities.push(existingLocatity)
    }

    article.countries = countries
    article.pan_countries = panCountries
    article.regions = regions
    article.state_or_provinces = states
    article.localities = localities

    await this.articleRepository.save(article)
  }

  async getGeography(): Promise<Geography> {
    const countries = await this.countryRepository.find({
      order: {
        country: 'ASC',
      },
    })

    const panCountries = await this.panCountryRepository.find({
      order: {
        panCountry: 'ASC',
      },
    })

    const regions = await this.regionRepository.find({
      order: {
        region: 'ASC',
      },
    })

    const state = await this.stateRepository.find({
      order: {
        state: 'ASC',
      },
    })

    const localities = await this.localityRepository.find({
      order: {
        locality: 'ASC',
      },
    })

    return {
      countries,
      panCountries,
      regions,
      state,
      localities,
    }
  }
}
