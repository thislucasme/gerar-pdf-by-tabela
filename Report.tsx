import {
	Alert,
	AlertIcon, Center, Divider, Editable, EditableInput, EditablePreview, Spinner, VStack
} from "@chakra-ui/react";
import { Button, message, Result, Table, Tag, Tooltip, Typography } from "antd";
import { ColumnType } from "antd/lib/table";
import { jsPDF } from "jspdf";
import React, { useEffect, useMemo, useState } from "react";
import { InfoEmpresa } from "../components/InfoEmpresa";
import { useCotacao } from "../hooks/useCotacao";
import { useFlagFornecedor } from "../hooks/useFlagFornecedor";
import { CotacaoTDO, CotacaoTDOPayload } from "../lib/types";
import { useStatusEnvio } from '../hooks/useStatusEnvio'
import { Caminho } from "../components/CaminhoIndicador";

const { Text } = Typography;



export const Report = () => {

	const { vendedor } = useStatusEnvio();
	const [isLoadingPage, setIsLoadingPage] = useState(false);

	const success = () => {
		message.success('Baixando relatório!');
	};
	const { cotacoes } = useCotacao();
	const [isGerando, setIsGerando] = useState(false);
	const [isEnviado, setEnviado] = useState(false);
	const { apiPostVerificarFlagFornecedor } = useFlagFornecedor();


	async function teste() {
		const payload: CotacaoTDOPayload = {
			codigo: "0000000001",
			fornecedor: "AG000002",
			flag: "."
		}
		setIsLoadingPage(true)
		const response = await apiPostVerificarFlagFornecedor(payload);
		setIsLoadingPage(false)

		for (let i = 0; i < response.data.length; i++) {
			if (response.data[i].flag6 !== 'P') {
				setEnviado(false)
				return;
			} else {
				setEnviado(true)

			}
			//console.log(response.data[i].flag6 !== 'P', response.data[i].flag6)
		}
		console.log(response)
		console.log("console.log()", isEnviado)
		localStorage.setItem(`@App:enviado`, JSON.stringify(isEnviado));
		//	const item = localStorage.getItem(`@App:${record.item}`) as string;
	}


	useEffect(() => {
		teste();
	}, [])

	var generateData = function () {

		const itens: Array<CotacaoTDO> = [
			...cotacoes.data
		]
		console.log(itens)
		console.log(cotacoes.data.length)
		var result = [];
		var data = {
			item: "dd",
			codigo_barras: "codigo_barras",
			codigo_interno: "codigo_interno",
			descricao: "descricao",
			marca: "marca",
			quantidade: "quantidade",
			custo: "custo",
			frete: "frete",
			st: "st",
			icms: "icms",
			forma_pagamento: "forma_pagamento",
			ipi: "ipi",
			mva: "mva"
		};
		for (var i = 0; i < cotacoes.data.length; i += 1) {
			data.item = itens[i].item ? itens[i].item : "x-x-x";
			data.quantidade = itens[i].quantidade ? itens[i].quantidade.toString() : "0";
			data.codigo_barras = itens[i].codbarras ? itens[i].codbarras : "0";
			data.codigo_interno = itens[i].codigo ? itens[i].codigo : "0";
			data.descricao = itens[i].descricao ? itens[i].descricao : "x-x-x-x-x";
			data.marca = itens[i].marca ? itens[i].marca : "x-x-x-x-x";
			data.custo = itens[i].valordoproduto ? itens[i].valordoproduto.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : "x-x-x-x-x";
			data.frete = itens[i].frete ? itens[i].frete.toString() : "x-x-x-x-x";
			data.st = itens[i].st ? itens[i].st.toString() : "x-x-x-x-x";
			data.icms = itens[i].icms ? itens[i].icms.toString() : "x-x-x-x-x";
			data.forma_pagamento = itens[i].formaPagamento ? itens[i].formaPagamento.toString() : "x-x-x-x-x";
			data.ipi = itens[i].ipi ? itens[i].ipi.toString() : "x-x-x-x-x";
			data.mva = itens[i].mva ? itens[i].mva.toString() : "x-x-x-x-x";
			result.push(Object.assign({}, data));
		}
		return result;
	};

	function createHeaders(keys: any) {
		var result = [];
		for (var i = 0; i < keys.length; i += 1) {
			result.push({
				id: keys[i],
				name: keys[i],
				prompt: keys[i],
				width: 65,
				align: "center",
				padding: 0
			});
		}
		return result;
	}

	var headers: any = createHeaders([
		"item",
		"codigo_barras",
		"codigo_interno",
		"descricao",
		"marca",
		"quantidade",
		"custo",
		"frete",
		"st",
		"icms",
		"forma_pagamento",
		"ipi",
		"mva"
	]);

	function gerarRelatorio() {
		success();
		setIsGerando(true)
		var doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });

		doc.table(3, 3, generateData(20), headers, { autoSize: true, fontSize: 8 }).save('relatório');
		setIsGerando(false)
	}
	
	return (
		<>
			<Button loading={isGerando} onClick={gerarRelatorio} type="primary">Gerar relatório</Button>
		</>
	)
}

