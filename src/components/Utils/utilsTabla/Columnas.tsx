/* eslint-disable no-unused-vars */
import { get, set } from 'lodash';
import { DataTableColumnTextAlign } from 'mantine-datatable';
import IconArrowLeft from '../../Icon/IconArrowLeft';
import IconEqual from '../../Icon/IconEqual';
import { useState } from 'react';
import { IndicadorRealizacion, IndicadorRealizacionAccion, IndicadorResultado } from '../../../types/Indicadores';
import { useTranslation } from 'react-i18next';
const totalKeys = {
    'metaAnual.total': { root: 'metaAnual', hombres: 'metaAnual.hombres', mujeres: 'metaAnual.mujeres', total: 'metaAnual.total' },
    'metaFinal.total': { root: 'metaFinal', hombres: 'metaFinal.hombres', mujeres: 'metaFinal.mujeres', total: 'metaFinal.total' },
    'ejecutado.total': { root: 'ejecutado', hombres: 'ejecutado.hombres', mujeres: 'ejecutado.mujeres', total: 'ejecutado.total' },
};

export function editableColumnByPath<T extends object>(
    accessor: string,
    title: string,
    setIndicadores: React.Dispatch<React.SetStateAction<T[]>>,
    editableRowIndex: number | null,
    editable = true,
    reglasEspeciales?: { realizacion: number[]; resultado: number[] },
    plurianual?: boolean
) {
    const { t } = useTranslation();

    const commonStyleNumber: React.CSSProperties = {
        maxWidth: 60,
        width: '100%',
        minWidth: 60,
        textAlign: 'center',
        height: 32,
        lineHeight: '32px',
        boxSizing: 'border-box',
    };
    const wrapperStyleNumber: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const commonStyleText: React.CSSProperties = {
        maxWidth: accessor === 'descripcion' ? 250 : 200,
        width: '100%',
        minWidth: accessor === 'descripcion' ? 250 : 200,
        textAlign: 'left',
        lineHeight: '32px',
        boxSizing: 'border-box',
    };
    const wrapperStyleText: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'start',
    };
    const [tempValue, setTempValue] = useState<string>('');

    return {
        accessor,
        title,
        sortable: true,
        render: (row: T & IndicadorRealizacionAccion, index: number) => {
            let esDesagregacionSexo = false;
            if (reglasEspeciales) {
                if (row.indicadorRealizacionId != undefined) {
                    let idIndicador = row.indicadorRealizacionId;
                    if (idIndicador === 0) {
                        const datosGuardados = localStorage.getItem('indicadoresRealizacion');

                        const datos: IndicadorRealizacion[] = datosGuardados ? JSON.parse(datosGuardados) : [];
                        idIndicador = datos.find((e) => e.NameEs === row.descripcion)?.Id ?? 0;
                    }
                    if (reglasEspeciales.realizacion.includes(idIndicador)) {
                        esDesagregacionSexo = true;
                    }
                } else if (row.indicadorResultadoId != undefined) {
                    let idIndicador = row.indicadorResultadoId;
                    if (idIndicador === 0) {
                        const datosGuardados = localStorage.getItem('indicadoresResultado');

                        const datos: IndicadorResultado[] = datosGuardados ? JSON.parse(datosGuardados) : [];
                        idIndicador = datos.find((e) => e.NameEs === row.descripcion)?.Id ?? 0;
                    }
                    if (reglasEspeciales.resultado.includes(idIndicador)) {
                        esDesagregacionSexo = true;
                    }
                }
            }
            const isEditable = editableRowIndex === index && editable;

            const value = get(row, accessor);
            const visual = value === 0 || value === '0' || value === '' || value === null || typeof value === 'undefined' ? '-' : value;

            if (accessor.endsWith('total')) {
                const keys = totalKeys[accessor as keyof typeof totalKeys];
                const hombres = Number(get(row, keys.hombres)) || 0;
                const mujeres = Number(get(row, keys.mujeres)) || 0;
                const total = Number(get(row, keys.total)) || 0;
                const ambosCero = hombres === 0 && mujeres === 0;
                const [mostrarAviso, setMostrarAviso] = useState(false);

                const handleAviso = () => {
                    if (esDesagregacionSexo) {
                        setMostrarAviso(true);
                        setTimeout(() => setMostrarAviso(false), 2500);
                    }
                };
                return (
                    <div style={wrapperStyleNumber} className={esDesagregacionSexo ? 'relative cursor-pointer' : ''} onClick={() => handleAviso()}>
                        {isEditable ? (
                            <div className="flex flex-col">
                                <input
                                    disabled={esDesagregacionSexo}
                                    className={ambosCero ? `border p-1 rounded text-center` : `border p-1 rounded bg-gray-100 text-gray-700 text-center ${esDesagregacionSexo && 'h-1/2'}`}
                                    value={tempValue == '' ? (ambosCero ? total : hombres + mujeres) : tempValue}
                                    style={{
                                        ...commonStyleNumber,
                                        pointerEvents: esDesagregacionSexo ? 'none' : 'auto',
                                    }}
                                    readOnly={!ambosCero}
                                    onChange={(e) => {
                                        setTempValue(e.target.value);
                                    }}
                                    onBlur={(e) => {
                                        setTempValue('');
                                        if (!plurianual && accessor.startsWith('metaAnual')) {
                                            setIndicadores((prevRows) => {
                                                const copy = [...prevRows];
                                                const updatedRow = { ...copy[index] };

                                                set(updatedRow as object, accessor, e.target.value);

                                                const metaFinalAccessor = accessor.replace('metaAnual', 'metaFinal');
                                                set(updatedRow as object, metaFinalAccessor, e.target.value);

                                                copy[index] = updatedRow;
                                                return copy;
                                            });
                                        } else {
                                            setIndicadores((prevRows) => {
                                                const copy = [...prevRows];
                                                const updatedRow = { ...copy[index] };
                                                set(updatedRow as object, accessor, Number(e.target.value));
                                                copy[index] = updatedRow;
                                                return copy;
                                            });
                                        }
                                    }}
                                />
                                {mostrarAviso && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bg-yellow-200 text-gray-800 text-xs px-2 py-1 rounded shadow animate-fade-in">{t('DesagregacionSexo')}</div>
                                )}
                            </div>
                        ) : (
                            <span style={commonStyleNumber}>{ambosCero ? total : hombres + mujeres}</span>
                        )}
                    </div>
                );
            }

            if (accessor.endsWith('mujeres') || accessor.endsWith('hombres')) {
                return (
                    <div style={wrapperStyleNumber}>
                        {isEditable ? (
                            <input
                                className="border p-1 rounded text-center"
                                value={tempValue == '' ? get(row, accessor) ?? '' : tempValue}
                                required={true}
                                style={commonStyleNumber}
                                onChange={(e) => {
                                    setTempValue(e.target.value);
                                }}
                                onBlur={(e) => {
                                    setTempValue('');
                                    const nuevoValor = Number(e.target.value) || 0;
                                    const accessorContrario = accessor.endsWith('mujeres') ? accessor.replace('mujeres', 'hombres') : accessor.replace('hombres', 'mujeres');

                                    const valorContrario = Number(get(row, accessorContrario)) || 0;

                                    const accessorTotal = accessor.replace(/(mujeres|hombres)$/, 'total');

                                    setIndicadores((prevRows) => {
                                        const copy = [...prevRows];
                                        const updatedRow = { ...copy[index] };
                                        set(updatedRow as object, accessor, nuevoValor);
                                        set(updatedRow as object, accessorTotal, nuevoValor + valorContrario);
                                        if (!plurianual && accessor.startsWith('metaAnual')) {
                                            const metaFinalAccessor = accessor.replace('metaAnual', 'metaFinal');
                                            if (accessor.endsWith('mujeres') || accessor.endsWith('hombres')) {
                                                set(updatedRow as object, metaFinalAccessor, nuevoValor);
                                            } else {
                                                set(updatedRow as object, metaFinalAccessor, nuevoValor + valorContrario);
                                            }
                                        }
                                        copy[index] = updatedRow;
                                        return copy;
                                    });
                                }}
                            />
                        ) : (
                            <span style={commonStyleNumber}>{visual}</span>
                        )}
                    </div>
                );
            }

            return (
                <div style={wrapperStyleText}>
                    {isEditable ? (
                        <input
                            className="border p-1 rounded text-left"
                            value={tempValue == '' ? get(row, accessor) ?? '' : tempValue}
                            required={true}
                            style={commonStyleText}
                            onChange={(e) => {
                                setTempValue(e.target.value);
                            }}
                            onBlur={(e) => {
                                setTempValue('');
                                setIndicadores((prevRows) => {
                                    const copy = [...prevRows];
                                    const updatedRow = { ...copy[index] };
                                    set(updatedRow as object, accessor, e.target.value);
                                    copy[index] = updatedRow;
                                    return copy;
                                });
                            }}
                        />
                    ) : (
                        <span style={commonStyleText}>{visual}</span>
                    )}
                </div>
            );
        },
    };
}
type CustomEditor<T, V> = (value: V, onChange: (value: V) => void, row: T, index: number) => React.ReactNode;

export function editableColumnByPathInput<T extends { id: number }, V = unknown>(
    accessor: string,
    title: string,
    setIndicadores: React.Dispatch<React.SetStateAction<T[]>>,
    editableRowIndex: number | null,
    anchura?: number,
    customEditor?: CustomEditor<T, V>
) {
    const isNested = accessor.includes('.');
    if (!anchura) {
        anchura = isNested ? 60 : accessor === 'descripcion' || accessor === 'hipotesis' ? 300 : 400;
    }

    return {
        accessor,
        title,
        width: anchura,
        render: (row: T, index: number) => {
            if (accessor === 'year1' || accessor === 'year2') {
                console.log(accessor);
            }
            const value = get(row, accessor) as V;

            const style: React.CSSProperties = {
                width: anchura,
                maxWidth: anchura,
                minWidth: anchura,
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
            };

            if (editableRowIndex != null && editableRowIndex === index) {
                const onChange = (newValue: V) => {
                    setIndicadores((prevRows) => {
                        return prevRows.map((item) => {
                            if (item.id === row.id) {
                                const updatedItem = { ...item };
                                set(updatedItem as object, accessor, newValue);
                                return updatedItem;
                            }
                            return item;
                        });
                    });
                };

                if (customEditor) {
                    return customEditor(value, onChange, row, index);
                }

                return <input className="border p-1 rounded text-left" value={String(value ?? '')} required style={style} onChange={(e) => onChange(e.target.value as V)} />;
            } else {
                if (accessor === 'objetivo') {
                    if (value && (value === 'Aumentar' || value === 'Mantener' || value === 'Disminuir')) {
                        switch (value) {
                            case 'Aumentar':
                                return (
                                    <div>
                                        <IconArrowLeft className="w-5 h-5 -rotate-90" />
                                    </div>
                                );
                            case 'Mantener':
                                return (
                                    <div>
                                        <IconEqual className="w-5 h-5" />
                                    </div>
                                );
                            case 'Disminuir':
                                return (
                                    <div>
                                        <IconArrowLeft className="w-5 h-5 rotate-90" />
                                    </div>
                                );
                        }
                    }
                }
                const visual = value === 0 || value === '0' || value === '' || value === null || typeof value === 'undefined' ? '-' : value;

                return <span style={style}>{String(visual)}</span>;
            }
        },
    };
}

export function visualColumnByPath<T extends object>(accessor: string, title: string, anchura?: number) {
    const esColumnaNombre = accessor === 'descripcion' || accessor === 'indicador';

    return {
        accessor,
        title,
        width: anchura,
        textAlign: 'center' as DataTableColumnTextAlign,
        sortable: true,
        render: (row: T) => {
            if (((title === 'Tot.' || title === 'Total') && accessor === 'metaAnual.total') || accessor === 'metaFinal.total' || accessor === 'ejecutado.total') {
                const keys = totalKeys[accessor as keyof typeof totalKeys];
                const hombres = Number(get(row, keys.hombres)) || 0;
                const mujeres = Number(get(row, keys.mujeres)) || 0;
                const total = Number(get(row, keys.total)) || 0;
                const ambosCero = hombres === 0 && mujeres === 0;

                return (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span
                            style={{
                                maxWidth: 60,
                                display: 'inline-block',
                                margin: '0 auto',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {ambosCero ? total : hombres + mujeres}
                        </span>
                    </div>
                );
            }

            if (accessor.startsWith('porcentaje')) {
                const esperado = { H: 0, M: 0, T: 0 };
                const conseguido = { H: 0, M: 0, T: 0 };
                if (accessor.startsWith('porcentajeS')) {
                    esperado.H = Number(get(row, 'previsto.hombres')) || 0;
                    esperado.M = Number(get(row, 'previsto.mujeres')) || 0;
                    esperado.T = Number(get(row, 'previsto.valor')) || 0;
                    conseguido.H = Number(get(row, 'alcanzado.hombres')) || 0;
                    conseguido.M = Number(get(row, 'alcanzado.mujeres')) || 0;
                    conseguido.T = Number(get(row, 'alcanzado.valor')) || 0;
                } else {
                    esperado.H = Number(get(row, 'metaAnual.hombres')) || 0;
                    esperado.M = Number(get(row, 'metaAnual.mujeres')) || 0;
                    esperado.T = Number(get(row, 'metaAnual.total')) || 0;
                    conseguido.H = Number(get(row, 'ejecutado.hombres')) || 0;
                    conseguido.M = Number(get(row, 'ejecutado.mujeres')) || 0;
                    conseguido.T = Number(get(row, 'ejecutado.total')) || 0;
                }

                const porcentajeHombre = esperado.H > 0 ? (conseguido.H > 0 ? (conseguido.H / esperado.H) * 100 : 0) : 0;
                const porcentajeMujeres = esperado.M > 0 ? (conseguido.M > 0 ? (conseguido.M / esperado.M) * 100 : 0) : 0;

                let width = 0;
                switch (title) {
                    case 'Hbr.':
                        width = porcentajeHombre;
                        break;

                    case 'Muj.':
                        width = porcentajeMujeres;
                        break;

                    case 'Tot.': {
                        let porcentajeTotal = 0;
                        if (porcentajeHombre != 0 || porcentajeMujeres != 0) {
                            porcentajeTotal = (porcentajeHombre + porcentajeMujeres) / 2;
                        } else {
                            porcentajeTotal = esperado.T > 0 ? (conseguido.T > 0 ? (conseguido.T / esperado.T) * 100 : 0) : 0;
                        }
                        width = porcentajeTotal;
                        break;
                    }
                }

                let colorFrom = '#A1EE89';
                let colorTo = '#8ED279';
                if (width >= 50 && width <= 85) {
                    colorFrom = '#EADB87';
                    colorTo = '#D5C778';
                } else if (width < 50) {
                    colorFrom = '#F76A6A';
                    colorTo = '#DD5D5D';
                }

                return width === 0 && (title === 'Hbr.' || title === 'Muj.') ? (
                    <div>
                        <span className="block text-center">-</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-start">
                        <div className="w-full relative">
                            <div className="w-full rounded-full h-5 bg-dark-light overflow-hidden shadow-3xl dark:shadow-none dark:bg-dark-light/10">
                                <div
                                    className="bg-gradient-to-r h-full rounded-full"
                                    style={{
                                        width: `${width}%`,
                                        background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
                                    }}
                                ></div>
                            </div>
                            <span
                                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs dark:text-white-light"
                                style={{ width: '100%', textAlign: 'center', pointerEvents: 'none' }}
                            >
                                {Number(width).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                );
            }

            const value = get(row, accessor);
            const visual = value === 0 || value === '0' || value === '' || value === null || typeof value === 'undefined' ? '-' : value;
            return (
                <div style={esColumnaNombre || accessor === 'hipotesis' ? {} : { display: 'flex', justifyContent: 'left' }}>
                    <span
                        className={esColumnaNombre || accessor === 'hipotesis' ? 'text-left' : 'text-center'}
                        style={{
                            maxWidth: !esColumnaNombre && accessor !== 'hipotesis' ? 60 : 300,
                            display: 'inline-block',
                            margin: '0 auto',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {visual}
                    </span>
                </div>
            );
        },
    };
}
