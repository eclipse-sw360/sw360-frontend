"use client"

import { Container, Row, Col, Form, OverlayTrigger, Tooltip,  Button } from "react-bootstrap"
import styles from "../AddProjects.module.css"
import { BiInfoCircle } from "react-icons/bi"
import { useState } from "react"

const ShowInfoOnHover = ({ text }: { text: string }) => {
    return (
        <>
          <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>}>
            <span className="d-inline-block">
              < BiInfoCircle />
            </span>
          </OverlayTrigger>
  
      </>
    );
};  

export default function Administration() {

    const CLEARING_STATE_INFO = `
    Open: 
    In Progress: 
    Closed:
    `

    const PROJECT_STATE_INFO = `
    Active: 
    Phaseout: 
    Unknown:
    `

    const LICENSE_INFO_HEADER_DEFAULT_TEXT = `
    English / English
    
    Note to Resellers: Please pass on this document to your customers to avoid license infringements.
    Third-Party Software Information
    
    This product, solution or service ("Product") contains third-party software components listed in this document. These components are Open Source Software licensed under a license approved by the Open Source Initiative (www.opensource.org) or similar licenses as determined by SIEMENS ("OSS") and/or commercial or freeware software components. With respect to the OSS components, the applicable OSS license conditions prevail over any other terms and conditions covering the Product. The OSS portions of this Product are provided royalty-free and can be used at no charge.
    
    If SIEMENS has combined or linked certain components of the Product with/to OSS components licensed under the GNU LGPL version 2 or later as per the definition of the applicable license, and if use of the corresponding object file is not unrestricted ("LGPL Licensed Module", whereas the LGPL Licensed Module and the components that the LGPL Licensed Module is combined with or linked to is the "Combined Product"), the following additional rights apply, if the relevant LGPL license criteria are met: (i) you are entitled to modify the Combined Product for your own use, including but not limited to the right to modify the Combined Product to relink modified versions of the LGPL Licensed Module, and (ii) you may reverse-engineer the Combined Product, but only to debug your modifications. The modification right does not include the right to distribute such modifications and you shall maintain in confidence any information resulting from such reverse-engineering of a Combined Product.
    
    Certain OSS licenses require SIEMENS to make source code available, for example, the GNU General Public License, the GNU Lesser General Public License and the Mozilla Public License. If such licenses are applicable and this Product is not shipped with the required source code, a copy of this source code can be obtained by anyone in receipt of this information during the period required by the applicable OSS licenses by contacting the following address.
    
    SIEMENS may charge a handling fee of up to 5 Euro to fulfil the request.
    Warranty regarding further use of the Open Source Software
    
    SIEMENS' warranty obligations are set forth in your agreement with SIEMENS. SIEMENS does not provide any warranty or technical support for this Product or any OSS components contained in it if they are modified or used in any manner not specified by SIEMENS. The license conditions listed below may contain disclaimers that apply between you and the respective licensor. For the avoidance of doubt, SIEMENS does not make any warranty commitment on behalf of or binding upon any third party licensor.
    
    German / Deutsch
    
    Hinweis an die Vertriebspartner: Bitte geben Sie dieses Dokument an Ihre Kunden weiter, um urheberrechtliche Lizenzverstöße zu vermeiden.
    Informationen zu Fremdsoftware
    
    Dieses Produkt, diese Lösung oder dieser Service ("Produkt") enthält die nachfolgend aufgelisteten Fremdsoftwarekomponenten. Bei diesen handelt es sich entweder um Open Source Software, die unter einer von der Open Source Initiative (www.opensource.org) anerkannten Lizenz oder einer durch Siemens als vergleichbar definierten Lizenz ("OSS") lizenziert ist und/oder um kommerzielle Software oder Freeware. Hinsichtlich der OSS Komponenten gelten die einschlägigen OSS Lizenzbedingungen vorrangig vor allen anderen auf dieses Produkt anwendbaren Bedingungen. SIEMENS stellt Ihnen die OSS-Anteile dieses Produkts ohne zusätzliche Kosten zur Verfügung.
    
    Soweit SIEMENS bestimmte Komponenten des Produkts mit OSS Komponenten gemäß der Definition der anwendbaren Lizenz kombiniert oder verlinkt hat, die unter der GNU LGPL Version 2 oder einer späteren Version lizenziert werden und soweit die entsprechende Objektdatei nicht unbeschränkt genutzt werden darf ("LGPL-lizenziertes Modul", wobei das LGPL-lizenzierte Modul und die Komponenten, mit welchen das LGPL-lizenzierte Modul verbunden ist, nachfolgend "verbundenes Produkt" genannt werden) und die entsprechenden LGPL Lizenzkriterien erfüllt sind, dürfen Sie zusätzlich (i) das verbundene Produkt für eigene Verwendungszwecke bearbeiten und erhalten insbesondere das Recht, das verbundene Produkt zu bearbeiten, um es mit einer modifizierten Version des LGPL lizenzierten Moduls zu verlinken und (ii) das verbundene Produkt rückentwickeln, jedoch ausschließlich zum Zwecke der Fehlerkorrektur Ihrer Bearbeitungen. Das Recht zur Bearbeitung schließt nicht das Recht ein, diese zu distribuieren. Sie müssen sämtliche Informationen, die Sie aus dem Reverse Engineering des verbundenen Produktes gewinnen, vertraulich behandeln.
    
    Bestimmte OSS Lizenzen verpflichten SIEMENS zur Herausgabe des Quellcodes, z.B. die GNU General Public License, die GNU Lesser General Public License sowie die Mozilla Public License. Soweit diese Lizenzen Anwendung finden und das Produkt nicht bereits mit dem notwendigen Quellcode ausgeliefert wurde, so kann eine Kopie des Quellcodes von jedermann während des in der anwendbaren OSS Lizenz angegebenen Zeitraums unter der folgenden Anschrift angefordert werden.
    
    SIEMENS kann für die Erfüllung der Anfrage eine Bearbeitungsgebühr von bis zu 5 Euro in Rechnung stellen.
    Gewährleistung betreffend Verwendung der Open Source Software
    
    Die Gewährleistungspflichten von SIEMENS sind in dem jeweiligen Vertrag mit SIEMENS geregelt. Soweit Sie das Produkt oder die OSS Komponenten modifizieren oder in einer anderen als der von SIEMENS spezifizierten Weise verwenden, ist die Gewährleistung ausgeschlossen und eine technische Unterstützung erfolgt nicht. Die nachfolgenden Lizenzbedingungen können Haftungsbeschränkungen enthalten, die zwischen Ihnen und dem jeweiligen Lizenzgeber gelten. Klarstellend wird darauf hingewiesen, dass SIEMENS keine Gewährleistungsverpflichtungen im Namen von oder verpflichtend für einen Drittlizenzgeber abgibt.
    
    Chinese / 中文
    
    经销商须知： 请将本文件转发给您的客户，以避免构成对许可证的侵权。
    第三方软件信息
    
    本产品、解决方案或服务（统称“本产品”）中包含本文件列出的第三方软件组件。 这些组件是开放源代码促进会 (www.opensource.org) 批准的许可证或西门子确定的类似许可证所许可的开放源代码软件（简称“OSS”）和/或商业或免费软件组件。 针对 OSS组件，适用的 OSS 许可证条件优先于涵盖本产品的任何其他条款和条件。 本产品的 OSS 部分免许可费，可以免费使用。
    
    如果西门子已经按照所适用的许可证的定义，根据第 2版或之后版本的GNU LGPL将本产品的某些组件与获得许可证的 OSS组件相组合或关联，并且如果使用相应的目标文件并非不受限制（“LGPL许可模块”，LGPL 许可模块以及与 LGPL 许可模块相组合或关联的组件统称为“组合产品”），则在符合以下相关LGPL许可标准的前提下，以下附加权利予以适用： (i) 您有权修改组合产品供自己使用，包括但不限于修改组合产品以重新连接 LGPL 许可模块修改版本的权利，并且 (ii) 您可以对组合产品进行逆向工程（但仅限于调试您的修改）。修改权不包括散布此类修改的权利，您应对此类组合产品逆向工程所获得的任何信息予以保密。
    
    某些 OSS 许可证需要西门子提供源代码，例如 GNU 通用公共许可证、GNU 宽通用公共许可证和 Mozilla 公共许可证。如果适用此类许可证并且本产品发货时未随附所需的源代码，收到本信息的任何 人可以在所适用的OSS许可证要求的期限内通过以下地址联系获取这些源代码的副本。
    
    西门子可收取最多 5 欧元的手续费以完成该请求。
    关于进一步使用开放源代码软件的保修
    
    您与西门子的协议中规定了西门子的保修义务。如果以西门子未指明的任何方式修改或使用本产品或其中包含的任何 OSS组件，西门子不为其提供任何保修或技术支持服务。下面列出的许可证条件可能包含适用于您和相应许可人之间的免责声明。为了避免产生疑问，西门子不代表或约束任何第三方许可人作出任何保修承诺。
    
    Spanish / Español
    
    Indicación para los distribuidores: Sírvase entregar este documento a sus clientes para prevenir infracciones de licencia sobre los aspectos de los derechos de autor.
    Información sobre software de terceros
    
    Este producto, solución o servicio ("producto") contiene los siguientes componentes de software de terceros listados a continuación. Se trata de Open Source Software cuya licencia ha sido otorgada por la Open Source Initiative (www.opensource.org) o que corresponde a una licencia definida por Siemens como comparable ("OSS") y/o de software o freeware comercial. En relación a los componentes OSS prevalecen las condiciones de concesión de licencia OSS pertinentes por sobre todas las demás condiciones aplicables para este producto. SIEMENS le entrega estas partes OSS del producto sin coste adicional.
    
    En la medida en que SIEMENS haya combinado o enlazado determinados componentes del producto con componentes OSS según la definición de la licencia aplicable, cuya licencia está sujeta a la GNU LGPL versión 2 o una versión posterior y que no se puede utilizar sin restricciones ("módulo con licencia LGPL", denominándose a continuación el módulo de licencia LGPL y los componentes combinados con el módulo de licencia LGPL, como "producto integrado") y que se hayan cumplido los criterios de licencia LGPL correspondientes, usted está autorizado para adicionalmente (i) procesar el producto conectado para sus propios fines de uso y obtener particularmente el derecho a procesar el producto conectado para enlazarlo con una versión modificada del módulo de licencia LGPL y (ii) realizar ingeniería inversa para el producto conectado, pero exclusivamente para fines de corrección de errores de sus procesamientos. El derecho al procesamiento no incluye el derecho a su distribución. Está obligado a tratar de manera confidencial toda la información que obtiene en el marco de la ingeniería inversa del producto conectado.
    
    Determinadas licencias OSS obligan a Siemens a la publicación del código fuente, p. ej. la GNU General Public License, la GNU Lesser General Public License así como la Mozilla Public License. En la medida que se apliquen estas licencias y que el producto no se haya suministrado con el código fuente necesario, puede solicitarse una copia del código fuente por parte de cualquier persona durante el período indicado en la licencia OSS, mediante envío de la solicitud correspondiente a la siguiente dirección.
    
    SIEMENS puede facturar una tasa de servicio de hasta 5 Euros para la tramitación de la consulta.
    Garantía en relación al uso del Open Source Software
    
    Las obligaciones de Siemens relacionadas a la garantía del Software, están especificados en el contrato correspondiente con SIEMENS. En caso de modificar el producto o los componentes OSS o usarse de una manera que difiera del modo especificado por SIEMENS, dejará de tener vigencia la garantía y no habrá derechoal soporte técnico asociado a ella. Las siguientes condiciones de concesión de licencia pueden contener limitaciones de responsabilidad que rigen entre su parte y el licenciador correspondiente. Se aclara que SIEMENS no asume obligaciones de garantía en nombre de o en forma vinculante para licenciadores de terceros.
    
    French / Français
    
    Note pour les partenaires de distribution: veuillez transmettre ce document à vos clients pour éviter toutes infractions aux dispositions en matière de droits d’auteur.
    Informations sur des logiciels de tiers
    
    Le présent produit, solution ou service (« Produit ») contient des éléments de logiciels indiqués ci-après, appartenant à des tiers. Ces logiciels sont des Open Source Software dont l’utilisation est accordée en vertu d’une licence reconnue par la Open Service Initiative ( www.opensource.org), ou d’une licence équivalente définie comme telle par Siemens ("OSS"), et/ou en vertu d’un logiciel commercial ou un freeware. En ce qui concerne les composants OSS, les conditions de licence OSS pertinentes priment sur toutes les autres conditions éventuellement applicables au Produit. SIEMENS met à votre disposition gratuitement et sans frais supplémentaires les parties OSS du Produit.
    
    Si SIEMENS a combiné ou relié certains composants du Produit avec des éléments OSS dont l’utilisation est accordée en vertu de la licence GNU LGPL version 2 ou d'une version postérieure, conformément à la licence applicable, et si l’utilisation du fichier objet correspondant est soumise à des restrictions (« Module Sous Licence LGPL », le module sous licence LGPL et les composants avec lesquels ce module est lié, sont dénommés ci-après "Produit Lié"), si les critères de licence LGPL applicables sont respectés, vous avez également les droits suivants : (i) droit de modifier le Produit Lié pour votre propre usage , inclus notamment le droit de modifier le Produit Lié afin de le relier différentes versions modifiées du Module Sous Licence LGPL et (ii) droit de faire de la retro-ingénierie sur le Produit Lié, mais exclusivement afin de corriger les éventuels dysfonctionnements des modifications que vous y avez apportées. Le droit de modifier n’inclut pas le droit de distribuer ces modifications et toutes les informations que vous avez obtenues à l’occasion d’opérations de retro-ingénierie du Produit Lié seront strictement confidentielles.
    
    Certaines licences OSS, comme par exemple la GNU General Public License, la GNU Lesser General Public License, ainsi que la Mozilla Public License, obligent SIEMENS à divulguer le code source. Si ces licences sont applicables et si le Produit n’a pas été préalablement livré avec le code source nécessaire, une copie du code source peut être demandée pendant la durée de la licence OSS applicable, en s’adressant à l’adresse suivante.
    
    SIEMENS peut facturer des frais de traitement allant jusqu’à 5 Euro pour répondre à cette demande.
    Garantie relative à l’utilisation du logiciel Open Source
    
    Les obligations de garantie de SIEMENS sont définies dans votre contrat. Si vous modifiez le Produit ou les éléments OSS y contenus ou si vous les utilisez d’une manière autre que celle spécifiée par SIEMENS, vous perdez le bénéfice de la garantie et aucune assistance technique ne vous sera fournie. Les conditions de licence ci-après peuvent contenir des limitations de responsabilités applicables entre vous et le concédant. En tout état de cause, nous vous signalons que SIEMENS ne prend aucun engagement de garantie au nom et pour le compte de tiers concédants.
    
    Italian / Italiano
    
    IMPORTANTE per i partner commerciali: si prega di inoltrare il presente documento ai clienti per evitare violazioni delle condizioni di licenza.
    Informazioni relative al software di altri produttori
    
    Il presente prodotto, soluzione o servizio ("Prodotto") contengono componenti software di altri produttori elencati qui di seguito. Questi software di altri produttori possono essere Open Source Software (OSS), concessi in licenza con una licenza riconosciuta dall'Open Source Initiative ( www.opensource.org) o ritenuta equivalente da Siemens ("OSS"), e/o software o freeware commerciali. Per quanto riguarda i componenti dell'OSS, le relative condizioni di licenza pertinenti prevalgono rispetto a tutte le altre condizioni applicabili al presente Prodotto. SIEMENS mette a disposizione i componenti dell'OSS contenuti nel presente Prodotto senza costi aggiuntivi.
    
    Se SIEMENS ha combinato o linkato determinati componenti del Prodotto con prodotti dell'OSS secondo la definizione indicata nella licenza applicabile e concessa ai sensi della licenza GNU LGPL Version 2 o successiva, se il relativo file di oggetto non può essere utilizzato in maniera illimitata ("modulo concesso con licenza LGPL", vale a dire il modulo con licenza LGPL e i componenti a cui detto modello è collegato, denominati qui di seguito "Prodotto Collegato") e, infine, se i relativi criteri di licenza LGPL sono stati soddisfatti, sarà possibile inoltre (i) modificare il Prodotto Collegato per propri scopi di impiego, in particolare elaborare il Prodotto Collegato per linkarlo ad una versione modificata del modulo con licenza LGPL, e (ii) effettuare il reverse engineering del Prodotto Collegato, esclusivamente a fini di correzione degli errori di elaborazione. Il diritto di elaborazione non include il diritto di distribuire tali modifiche. Inoltre, tutte le informazioni ottenute con il reverse engineering del Prodotto Collegato devono essere trattate come riservate.
    
    Determinate licenze OSS obbligano SIEMENS a pubblicare il codice sorgente, ad es. la GNU General Public License, la GNU Lesser General Public License e la Mozilla Public License. Se queste licenze sono applicabili, e il presente Prodotto non è stato già fornito con il necessario codice sorgente, è possibile richiedere una copia di detto codice nel periodo di validità indicato nella licenza OSS applicabile al seguente indirizzo.
    
    Per l'evasione della richiesta, SIEMENS potrà addebitare fino a 5 Euro.
    Garanzia di utilizzo dell'Open Source Software
    
    Le obbligazioni di garanzia di SIEMENS sono disciplinate dal vostro contratto sottoscritto con SIEMENS. Se si modifica il Prodotto o i componenti dell'OSS, oppure li si utilizza in un modo diverso da quello specificato da SIEMENS, la garanzia e il supporto tecnico decadono. Le seguenti condizioni di licenza possono contenere limitazioni di responsabilità valevoli nel rapporto tra l'utente e il licenziante. Per maggiore chiarezza, si ribadisce che SIEMENS non concede alcuna garanzia a nome di, o vincolante per, qualsiasi terza parte licenziante.
    
    Japanese / 日本語
    
    再販業者への注意事項：ライセンス違反を防ぐため、本書を顧客の皆様に配布してください。
    他社製ソフトウェアの使用に関する情報
    
    本製品、ソリューション、またはサービス（以下「本製品」）には、本書に記載の他社製ソフトウェ アのコンポーネントが含まれています。該当するコンポーネントとは、Open Source Initiative ( www.opensource.org) によって認可されたライセンスのもとで使用許諾を得たオープンソースソフ トウェア、または SIEMENS によって決定された同様のライセンス（以下「OSS」）、および/または商用もしくはフリーウェアのソフトウェアコンポーネントを指します。本製品を対象とするその他いかなる契約条件に対しても、OSS のコンポーネントに関しては、適用される OSS ライセンス条件が優先するものとします。本製品の OSS の部分に関しては、著作権使用料無料で提供され、無料で使用する ことができます。
    
    SIEMENS が、本製品の特定のコンポーネントと適用されるライセンスの定義の通りに GNU LGPLのバージョン 2 以降のもとで使用許諾を得た OSS コンポーネントを組み合わせるか、関連付け、なおかつ付随するオブジェクト・ファイルの使用が制限されていない場合（以下「LGPL 使用許諾モジュー ル」、それに対し、LGPL使用許諾モジュールが組み合わされているか、関連付けられている LGPL 使用許諾済みモジュールとコンポーネントを「組み合わせ製品」という）、関連する LGPL 使用許諾の基準を満たしていれば、次の追加の権利が適用されます。(i) 個人的な使用のために組み合わせ製品を変更することができる（LGPL 使用許諾モジュールの変更したバージョンを再度関連付けるために組み合わせ製品を変更する権利を含むが、それに限定されるものではない）、および (ii) 組み合わせ製品にリバースエンジニアリングを行うことができる（ただし変更のデバッグのみ）。変更に関する権利には、該当する変更を配布する権利は含まれていません。また契約者の方は、このような組み合わせ製品のリバースエンジニアリングから生じるいかなる情報に関しても極秘として維持するものとします。
    
    例えば、GNU General Public License （GNU一般公衆利用許諾書）、GNU Lesser General Public License（GNU劣等一般公衆利用許諾書）、Mozilla Public License 等の特定の OSSライセンスでは、SIEMENS がソースコードを利用できるようにする必要があります。該当するライセンスが適用可能であり、本製品が必要とされるソースコードとともに出荷されなかった場合、この情報を受け取った人物が適用される OSS ライセンスによって義務付けられている期間中に以下の住所まで連絡することで、このソースコードのコピーを入手することができます。
    
    リクエストを実行するために SIEMENS では、最高 5 ユーロの手数料を請求する場合があります。
    オープンソースソフトウェアのさらなる使用に関する保証
    
    SIEMENS の保証義務は、契約者と SIEMENS との契約書に記載されています。本製品を SIEMENS が指定した以外の方法で変更したり、使用したりした場合、SIEMENS では本製品、またはいかなる OSS コンポーネントに対しても保証やテクニカルサポートを提供いたしません。以下に記載のライセンス条件には、 契約者と個別のライセンサーとの間で適用される免責事項が含まれる場合があります。誤解を避けるため、SIEMENSでは他社のライセンサーを代表、または他社を拘束するいかなる保証義務も負いません。
    
    Russian / Русский
    
    Информация для партнёров по сбыту: просим передать этот документ вашим клиентам во избежание нарушений лицензионных прав.
    Информация о программном обеспечении сторонних разработчиков
    
    Настоящий продукт, настоящее решение или сервис ("Продукт") включает в себя программные компоненты сторонних разработчиков, перечисленные ниже. Это компоненты программного обеспечения с открытым кодом, имеющие лицензию, признанную организацией Open Source Initiative ( www.opensource.org), либо иную лицензию согласно определению компании SIEMENS ("OSS"), и / или компоненты коммерческого либо свободно распространяемого программного обеспечения. В отношении компонентов OSS соответствующие условия лицензии OSS имеют приоритет перед всеми прочими положениями, применимыми к данному Продукту. SIEMENS предоставляет вам долевые права на OSS в отношении данного Продукта на безвозмездной основе.
    
    Если SIEMENS комбинирует или связывает определённые компоненты Продукта с компонентами OSS в соответствии с определением применимой лицензии, лицензированными по версии 2 или более поздней GNU LGPL, и если неограниченное использование соответствующего объектного файла не разрешено ("Модуль по лицензии LGPL", причём Модуль по лицензии LGPL и компоненты, с которыми скомбинирован или связан Модуль по лицензии LGPL, далее именуются "Комбинированный продукт") и выполнены соответствующие критерии лицензии LGPL, вам разрешается дополнительно (i) обрабатывать Комбинированный продукт в собственных целях и, в частности, но не ограничиваясь, обрабатывать Комбинированный продукт таким образом, чтобы связать его с модифицированной версией Модуля по лицензии LGPL, а также (ii) проводить обратную разработку Комбинированного продукта, но только в целях исправления ошибок вашей обработки. Право на обработку не включает в себя право на дистрибуцию. Вы обязаны сохранять конфиденциальность в отношении всей информации, полученной вами в ходе обратной разработки Комбинированного продукта.
    
    Определённые лицензии OSS обязывают SIEMENS раскрывать исходный код, например, GNU General Public License, GNU Lesser General Public License и Mozilla Public License. Если указанные лицензии применимы и Продукт поставлен без необходимого исходного кода, копия исходного кода может быть запрошена обладателем настоящей информации в течение времени, указанного в применимой лицензии OSS, по следующему адресу.
    
    За выполнение запроса SIEMENS может взимать сбор в размере до 5 евро.
    Гарантия в отношении дальнейшего применения программного обеспечения с открытым кодом
    
    Гарантийные обязательства SIEMENS регулируются соответствующим договором с компанией SIEMENS. Если вы модифицируете Продукт или компоненты OSS либо используете их иным образом, чем указано компанией SIEMENS, гарантия аннулируется, техническая поддержка не предоставляется. Приведённые ниже лицензионные условия могут включать в себя положения об ограничении ответственности, действующие в отношениях между вами и соответствующим лицензиаром. Во избежание сомнений подчёркиваем, что SIEMENS не даёт гарантии от имени сторонних лицензиаров и гарантии, налагающей обязательства на сторонних лицензиаров.
    Open Source Software and/or other third-party software contained in this Product
    
    If you like to receive a copy of the source code, please contact SIEMENS at the following address:
    
      Siemens AG
      Otto-Hahn-Ring 6
      81739 Munich
      Germany
      Keyword: Open Source Request (please specify Product name and version, if applicable)
    `

    const [licenseInfo, setLicenseInfo] = useState<string>(LICENSE_INFO_HEADER_DEFAULT_TEXT);

    return (
        <>
            <Container>
                <Row className="mb-4">
                    <Row className={`${styles["header"]} mb-2`}>
                        <p className="fw-bold mt-3">Clearing</p>
                    </Row>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.clearingState">
                                <Form.Label className="fw-bold">Clearing State</Form.Label>
                                <Form.Select defaultValue="Open" aria-describedby="addProjects.clearingState.HelpBlock">
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Closed">Closed</option>
                                </Form.Select>
                                <Form.Text id="addProjects.clearingState.HelpBlock" muted>
                                    < ShowInfoOnHover text={CLEARING_STATE_INFO} /> Learn more about project clearing state.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.clearingTeam">
                                <Form.Label className="fw-bold">Clearing Team</Form.Label>
                                <Form.Select defaultValue="ct" aria-label="Clearing Team">
                                    <option value="ct">ct</option>
                                    <option value="gp">gp</option>
                                    <option value="iot">iot</option>
                                    <option value="mo">mo</option>
                                    <option value="mo its">mo its</option>
                                    <option value="sgre">sgre</option>
                                    <option value="shs">shs</option>
                                    <option value="si">si</option>
                                    <option value="sop">sop</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.deadlinePreEvaluation">
                                <Form.Label className="fw-bold">Deadline for pre-evaluation</Form.Label>
                                <Form.Control type="text" aria-label="Deadline for pre-evaluation" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="Pre-evaluation date YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.clearingSummary">
                        <Form.Label className="fw-bold">Clearing Summary</Form.Label>
                        <Form.Control as="textarea" aria-label="Clearing Summary" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.specialRiskOpenSourceSoftware">
                        <Form.Label className="fw-bold">Special Risk Open Source Software</Form.Label>
                        <Form.Control as="textarea" aria-label="Special Risk Open Source Software" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.generalRiskThirdPartySoftware">
                        <Form.Label className="fw-bold">General risk 3rd party software</Form.Label>
                        <Form.Control as="textarea" aria-label="General risk 3rd party software" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.specialRiskThirdPartySoftware">
                        <Form.Label className="fw-bold">Special risk 3rd party software</Form.Label>
                        <Form.Control as="textarea" aria-label="Special risk 3rd party software" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.salesAndDeliveryChannels">
                        <Form.Label className="fw-bold">Sales and delivery channels</Form.Label>
                        <Form.Control as="textarea" aria-label="Sales and delivery channels" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.remarksAdditionalRequirements">
                        <Form.Label className="fw-bold">Remarks additional requirements</Form.Label>
                        <Form.Control as="textarea" aria-label="Remarks additional requirements" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <Row className="mb-4">
                    <Row className={`${styles["header"]} mb-2`}>
                        <p className="fw-bold mt-3">Lifecycle</p>
                    </Row>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.projectState">
                                <Form.Label className="fw-bold">Project State</Form.Label>
                                <Form.Select defaultValue="Open" aria-describedby="addProjects.projectState.HelpBlock">
                                    <option value="Active">Active</option>
                                    <option value="Phaseout">Phaseout</option>
                                    <option value="Unknown">Unknown</option>
                                </Form.Select>
                                <Form.Text id="addProjects.projectState.HelpBlock" muted>
                                    < ShowInfoOnHover text={PROJECT_STATE_INFO} /> Learn more about project state.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.systemTestBeginDate">
                                <Form.Label className="fw-bold">System test begin date</Form.Label>
                                <Form.Control type="text" aria-label="System test begin date" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="System test begin date YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.systemTestEndDate">
                                <Form.Label className="fw-bold">System test end date</Form.Label>
                                <Form.Control type="text" aria-label="System test end date" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="System test end date YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-2" />
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.deliveryStartDate">
                                <Form.Label className="fw-bold">Delivery start date</Form.Label>
                                <Form.Control type="text" aria-label="Delivery start date" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="Delivery start date YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.phaseOutDate">
                                <Form.Label className="fw-bold">Phase-out date</Form.Label>
                                <Form.Control type="text" aria-label="Phase-out date" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="Phase-out since YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`${styles["header"]} mb-2`}>
                        <p className="fw-bold mt-3">License Info Header</p>
                    </Row>
                    <Row className="d-flex justify-content-end">
                        <Col lg={3}>
                            <Button variant="primary" className={`${styles['button-link']} fw-normal`} onClick={() => { setLicenseInfo(LICENSE_INFO_HEADER_DEFAULT_TEXT) }}>Set to default text</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Form.Control as="textarea" value={licenseInfo} id="addProjects.licenseInfoHeader" aria-label="License Info Header" style={{ height: '500px' }} onChange={(e) => setLicenseInfo(e.target.value)}/>
                    </Row>
                </Row>
            </Container>
        </>
    )
}