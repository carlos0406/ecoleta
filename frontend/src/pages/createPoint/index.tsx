import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import logo from '../../assets/logo.svg';
import './style.css';
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'

interface Item {
    id: number,
    title: string,
    image: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}


const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([])
    const [selectedUf, setSelectedUf] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [InicialPosition, setInicialPosition] = useState<[number, number]>([0, 0])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [inputData, setInputData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })



    const history = useHistory();
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }

        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);


                setCities(cityNames);
            });
    }, [selectedUf])

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInicialPosition([latitude, longitude])
        })
    }, [])
    function onChangeUF(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function onChangeCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function onClickMap(event: LeafletMouseEvent) {

        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);

    }

    function onChangeInput(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setInputData({ ...inputData, [name]: value })

    }


    async function submitForm(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = inputData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;
        const data = {
            name,
            email,
            whatssap: whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        await api.post('points', data);
        history.push('/')
    }

    function onSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id)
        if (alreadySelected >= 0) {
            const filtereditems = selectedItems.filter(item => item !== id);
            setSelectedItems(filtereditems)
        } else {
            setSelectedItems([...selectedItems, id]);
        }

    }


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="" />
                <Link to='/'>
                    <FiArrowLeft />
                        Voltar para Home </Link>
            </header>

            <form onSubmit={submitForm}>
                <h1>Cadastro do <br />ponto de coleta </h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>

                    </legend>

                </fieldset>

                <div className="field">
                    <label htmlFor="name">Nome da entidade</label>
                    <input
                        onChange={onChangeInput}
                        type="text"
                        name='name'
                        id='name'
                    />

                </div>

                <div className="field-group">

                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input
                            onChange={onChangeInput}
                            type="email"
                            name='email'
                            id='email'
                        />

                    </div><div className="field">
                        <label htmlFor="whatsapp">whatsapp</label>
                        <input
                            onChange={onChangeInput}
                            type="text"
                            name='whatsapp'
                            id='whatsapp'
                        />

                    </div>
                </div>



                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>


                    </legend>
                    <Map center={InicialPosition} zoom={15} onClick={onClickMap}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />

                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">UF(Estado) </label>
                            <select name="uf" id="uf" value={selectedUf} onChange={onChangeUF}>
                                <option value="0">Selecione um UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}



                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade </label>
                            <select name="city" id="city" value={selectedCity} onChange={onChangeCity} >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </fieldset>





                <fieldset>
                    <legend>
                        <h2>ítens de coleta</h2>
                        <span>Selecione um ou mais do ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => onSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}






                    </ul>

                </fieldset>
                <button type='submit'>
                    Cadastrar ponto de coleta
                </button>

            </form>

        </div>


    );
}

export default CreatePoint;