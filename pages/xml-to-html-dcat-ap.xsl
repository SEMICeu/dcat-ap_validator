<?xml version="1.0"?>


<!--

XSLT script to format SPARQL Query Results XML Format into xhtml

Copyright Â© 2004, 2005 World Wide Web Consortium, (Massachusetts
Institute of Technology, European Research Consortium for
Informatics and Mathematics, Keio University). All Rights
Reserved. This work is distributed under the W3CÂ® Software
License [1] in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.

[1] http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231

Version 1 : Dave Beckett (DAWG)
Version 2 : Jeen Broekstra (DAWG)
Customization for SPARQler: Andy Seaborne
URIs as hrefs in results : Bob DuCharme & Andy Seaborne

-->

<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns="http://www.w3.org/1999/xhtml"
		xmlns:res="http://www.w3.org/2005/sparql-results#"
		xmlns:fn="http://www.w3.org/2005/xpath-functions"
		exclude-result-prefixes="res xsl">


  <xsl:output
   method="html" 
   indent="yes"
   encoding="UTF-8" 
   doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
   doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"
   omit-xml-declaration="no" />

    <xsl:template match="res:link">
      <p>Link to <xsl:value-of select="@href"/></p>
    </xsl:template>

    <xsl:template name="header">
      <div>
        <h2>Header</h2>
        <xsl:apply-templates select="res:head/res:link"/>
      </div>
    </xsl:template>

  <xsl:template name="boolean-result">
    <div>
      <p>ASK => <xsl:value-of select="res:boolean"/></p>
    </div>
  </xsl:template>


  <xsl:template name="vb-result">
    <div>
      <table id="results" style="table-layout:fixed;width:100%;word-wrap:break-word">
	<xsl:text>
	</xsl:text>
	<thead>
	<tr>
	  <xsl:for-each select="res:head/res:variable">
	    <xsl:variable name="x"><xsl:value-of select="@name"/></xsl:variable>
	    <th id="{$x}"><xsl:value-of select="@name"/></th>
	  </xsl:for-each>
	</tr>
	</thead>
	<xsl:text>
	</xsl:text>
	<tbody>
	<xsl:for-each select="res:results/res:result">
	  <tr>
	    <xsl:apply-templates select="."/>
	  </tr>
	</xsl:for-each>
	</tbody>
      </table>
    </div>
  </xsl:template>

  <xsl:template match="res:result">
    <xsl:variable name="current" select="."/>
    <xsl:for-each select="/res:sparql/res:head/res:variable">
      <xsl:variable name="name" select="@name"/>
      <td>
	<xsl:choose>
	  <xsl:when test="$current/res:binding[@name=$name]">
	    <!-- apply template for the correct value type (bnode, uri, literal) -->
	    <xsl:apply-templates select="$current/res:binding[@name=$name]"/>
	  </xsl:when>
	  <xsl:otherwise>
	    <!-- no binding available for this variable in this solution -->
	  </xsl:otherwise>
	</xsl:choose>
      </td>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="res:bnode">
    <xsl:text>_:</xsl:text>
    <xsl:value-of select="text()"/>

  </xsl:template>
  <xsl:template match="res:uri">
    <!-- Roughly: SELECT ($uri AS ?subject) ?predicate ?object { $uri ?predicate ?object } -->
    <!-- XSLT 2.0
    <xsl:variable name="x"><xsl:value-of select="fn:encode-for-uri(.)"/></xsl:variable>
    -->
    <xsl:variable name="x"><xsl:value-of select="."/></xsl:variable>
    <!--
    <xsl:variable name="query">SELECT%20%28%3C<xsl:value-of select="."/>%3E%20AS%20%3Fsubject%29%20%3Fpredicate%20%3Fobject%20%7B%3C<xsl:value-of select="."/>%3E%20%3Fpredicate%20%3Fobject%20%7D</xsl:variable>
    -->
     <xsl:variable name="query">SELECT%20%28%3C<xsl:value-of select="$x"/>%3E%20AS%20%3Fsubject%29%20%3Fpredicate%20%3Fobject%20%7B%3C<xsl:value-of select="$x"/>%3E%20%3Fpredicate%20%3Fobject%20%7D</xsl:variable>
    <a href="?query={$query}&amp;output=xml&amp;stylesheet=%2Fxml-to-html-admssw.xsl">
    <xsl:value-of select="."/>
    </a>
  </xsl:template>

  <xsl:template match="res:literal[@datatype]">
	<!-- datatyped literal value -->
    <xsl:value-of select="."/><!--"^^&lt;<xsl:value-of select="@datatype"/>&gt; -->
  </xsl:template>

  <xsl:template match="res:literal[@lang]">
	<!-- datatyped literal value -->
    "<xsl:value-of select="."/>"<xsl:value-of select="@xml:lang"/>
  </xsl:template>

  <xsl:template match="res:binding[@name='Rule_ID']">
	<!-- datatyped literal value -->
	<xsl:variable name="x"><xsl:value-of select="."/></xsl:variable>
	<xsl:variable name="rule_link">../sparql-doc/rule-<xsl:value-of select="normalize-space($x)"/>.html</xsl:variable>
	<a href="{$rule_link}"><xsl:value-of select="."/></a>
  </xsl:template>

    <xsl:template match="res:literal">
	<!-- non-datatyped literal value -->
	<xsl:choose>
		<xsl:when test=".='warning'">
		  <img src="/images/warning.png" width="15" height="15"/> warning
		</xsl:when>
		<xsl:when test=".='error'">
		  <img src="/images/error.png" width="15" height="15"/> error
		</xsl:when>	
		<xsl:when test=".='info'">
		  <img src="/images/info.png" width="15" height="15"/> info
		</xsl:when>			
		<xsl:otherwise>
			<xsl:value-of select="."/>
		</xsl:otherwise>	
	</xsl:choose>
  </xsl:template>


  <xsl:template match="res:sparql">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
      <head>
	    <title>DCAT-AP Validator: SPARQL Query Result</title> 
		<style>
	  <![CDATA[
	  h1 { font-size: 150% ; }
	  h2 { font-size: 125% ; }
	  table { border-collapse: collapse ; border: 1px solid black ; }
	  td, th
 	  { border: 1px solid black ;
	    padding-left:0.5em; padding-right: 0.5em; 
	    padding-top:0.2ex ; padding-bottom:0.2ex 
	  }
	  ]]>
		body {font-family:sans-serif} 
		h1 {color: white; background-color:#002060}
		header#branding {background-color: #002060;min-height:70px;width:100%;display:table;}
		header#branding img {float:left;}
		header#branding h1 {display:table-cell;vertical-align:middle;background: #002060;}
		#Rule_Origin{width:7%}
		#Rule_ID{width:5%}
		#Rule_Severity{width:7.8%}
		#Rule_Description{width:9.5%}
		#Message{width:20%
		#s{width:16.9%}
		#p{width:16.9%}
		#o{width:16.9%}
		
		</style>
		<!-- DataTables CSS -->
		<link rel="stylesheet" type="text/css" href="/DataTables-1.10.7/media/css/jquery.dataTables.css" />
      </head>
      <body>
	  <header id="branding">
	  <a href="https://joinup.ec.europa.eu/asset/dcat_application_profile/home"><img src="/images/DCAT_application_profile_for_European_data_portals_logo_0.png" width="70" height="70" alt="Asset Description Metadata Schema for Software (ADMS.SW) logo" /></a>
	  <h1>DCAT-AP Validator: SPARQL Query Result</h1>
	  </header>
	  <p>The table below displays all detected anomalies (if any).</p>


	<xsl:if test="res:head/res:link">
	  <xsl:call-template name="header"/>
	</xsl:if>

	<xsl:choose>
	  <xsl:when test="res:boolean">
	    <xsl:call-template name="boolean-result" />
	  </xsl:when>

	  <xsl:when test="res:results">
	    <xsl:call-template name="vb-result" />
	  </xsl:when>

	</xsl:choose>

		<!-- jQuery -->
		<script type="text/javascript" charset="utf8" src="/DataTables-1.10.7/media/js/jquery.js"></script>
		  
		<!-- DataTables -->
		<script type="text/javascript" charset="utf8" src="/DataTables-1.10.7/media/js/jquery.dataTables.js"></script>
		<!--
		<script>
			$(document).ready( function () {
				$('#results').DataTable();
			} );
		</script>
	    -->
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>