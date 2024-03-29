import { useEffect, useRef, useState } from 'react'
import { CircularProgress } from '@mui/material'
import { BRAND_NAME } from '../../../../constants'
import { useRequest } from '../../../../hooks'
import { VehicleListResponse } from '../../../../interfaces'
import './style.scss'
import { VehicleOverviewCard } from '../vehicle-overview-card'
import { useNavigate } from 'react-router-dom'

export function VehicleOverview({ brandKeyword }: { brandKeyword: string}) {
    const [ isListInViewport, setIsListInViewport] = useState<boolean>()
    const [ vehicleList, setVehicleList] = useState<VehicleListResponse[]>([])
    const [ isOverviewLoading, setIsOverviewLoading] = useState<boolean>(true);

    const { getCarOverview, getMotorcycleOverview } = useRequest()
    const navigate = useNavigate()
    const carOverviewListRef = useRef(null)

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        }
        const intersectionObserver = new IntersectionObserver((entries) => {
            const [ entry ] = entries
            setIsListInViewport(entry.isIntersecting)
        }, observerOptions)

        if (carOverviewListRef.current) intersectionObserver.observe(carOverviewListRef.current)

        return () => {
            if (carOverviewListRef.current) intersectionObserver.unobserve(carOverviewListRef.current)
        }
    }, [])

    useEffect(() => {
        async function getVehicleOverviewList() {
            try {
                const currentBrand = BRAND_NAME

                if (currentBrand === 'mazecar') {
                    const { data } = await getCarOverview()
                    setVehicleList(data)
                }

                if (currentBrand === 'mazemotorcycle') {
                    const { data } = await getMotorcycleOverview()
                    setVehicleList(data)
                }

                setIsOverviewLoading(false)
            } catch (error) {
                console.error(error)
            }
        }

        if (isListInViewport && vehicleList.length === 0) getVehicleOverviewList()
    }, [isListInViewport])

    return <section className="vehicle-overview-container">
        <div className="vehicle-overview-content">
            <h1 className="overview-title">Some of the available {brandKeyword}s</h1>

            <ul className="vehicle-list" ref={carOverviewListRef}>
                {isOverviewLoading && <li className="loading-container"><CircularProgress style={{ color: '#FFFFFF'}}/></li>}
                {vehicleList.map(({ id, brand, image, model, price}) => {
                    return <VehicleOverviewCard id={id}  brand={brand} image={image} model={model} price={price} key={id}/>
                })}
            </ul>

            {!isOverviewLoading && <button className="more-button" onClick={() => navigate('/search')}>More</button>}
        </div>
        </section>
}